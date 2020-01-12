import Big from 'big.js'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { subDays, startOfYesterday } from 'date-fns'
import * as actions from '../../actions'
import { groupByInstitution } from '../../../accounts/reducer'
import { initialState as transactionsInitialState } from '../../reducer'
import { initialState as settingsInitialState } from '../../../settings/reducer'
import { initialState as exchangeRatesInitialState } from '../../../exchangeRates/reducer'
import { getLastWeekday } from '../../../exchangeRates/actions'
import { initialState as budgetInitialState } from '../../../budget/reducer'
import { fiatCurrencies } from '../../../../data/currencies'
import {
  mockFetch,
  expectExchangeratesApiToHaveBeenCalledWith,
  generateFiatExchangeRatesResponse,
  generateExchangeRates
} from '../../../../setupTests'

jest.mock('uuid/v4', () => {
  let value = 0
  return () => {
    value += 1
    return value
  }
})

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

const mockStore = configureMockStore([thunk])

const account = {
  id: 1,
  name: 'Checking',
  institution: 'TD',
  openingBalance: 1000,
  openingBalanceDate: Date.now(),
  currentBalance: { accountCurrency: 1000, localCurrency: 1000 },
  currency: settingsInitialState.currency
}

const transaction = {
  accountId: 1,
  description: 'Shopping Mart',
  amount: { accountCurrency: 1, localCurrency: 1 },
  createdAt: Date.now()
}

const categoryId = budgetInitialState.categoryTree[0].options[0].id
const rule = {
  id: 1,
  accountId: account.id,
  attributes: { categoryId },
  filterBy: { description: { type: 'equals', value: transaction.description } }
}

describe('createTransaction', () => {
  describe('currency', () => {
    it('is the same as system currency', async () => {
      const byId = { [account.id]: account }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: transactionsInitialState,
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState,
        budget: budgetInitialState
      })
      const id = await store.dispatch(actions.createTransaction(account, transaction))
      expect(store.getActions()).toEqual([
        {
          type: 'CREATE_TRANSACTION',
          payload: {
            ...transaction,
            id,
            createdAt: transaction.createdAt + 1000
          }
        }, {
          // NOTE: UPDATE_ACCOUNT is called but account balance is not changed
          // because test library doesn't actually update the store
          payload: account,
          type: 'UPDATE_ACCOUNT'
        }, {
          type: 'GROUP_BY_INSTITUTION'
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: 'Transaction created', status: 'success' }
        }
      ])
    })

    describe('is different than system currency', () => {
      it('use existing exchange rates', async () => {
        const date = new Date('Mon, Sep 16 2019').getTime()
        const newAccount = { ...account, currency: Object.keys(fiatCurrencies)[0] }
        const byId = { [account.id]: newAccount }
        const store = mockStore({
          accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
          transactions: transactionsInitialState,
          settings: settingsInitialState,
          budget: budgetInitialState,
          exchangeRates: generateExchangeRates({
            currencies: [newAccount.currency],
            startAt: subDays(date, 10),
            endAt: startOfYesterday()
          })
        })
        const exchangeRate = store.getState().exchangeRates[newAccount.currency][date]
        expect(exchangeRate).toBeDefined()
        const mockSpy = mockFetch()
        const id = await store.dispatch(actions.createTransaction(newAccount, { ...transaction, createdAt: date }))
        expect(store.getActions()).toEqual([
          {
            type: 'CREATE_TRANSACTION',
            payload: {
              ...transaction,
              id,
              createdAt: date + 1000,
              amount: {
                ...transaction.amount,
                localCurrency: parseFloat(Big(transaction.amount.accountCurrency).div(Big(exchangeRate)))
              }
            }
          }, {
            // NOTE: UPDATE_ACCOUNT is called but account balance is not changed
            // because test library doesn't actually update the store
            payload: newAccount,
            type: 'UPDATE_ACCOUNT'
          }, {
            type: 'GROUP_BY_INSTITUTION'
          }, {
            type: 'SHOW_SNACKBAR',
            payload: { text: 'Transaction created', status: 'success' }
          }
        ])
        expect(mockSpy).not.toHaveBeenCalled()
      })

      it('fetch exchange rates', async () => {
        const lastWeekday = getLastWeekday()
        const newAccount = { ...account, currency: Object.keys(fiatCurrencies)[0] }
        const newTransaction = { ...transaction, createdAt: subDays(startOfYesterday(), 100).getTime() }
        const byId = { [newAccount.id]: newAccount }
        const store = mockStore({
          accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
          transactions: transactionsInitialState,
          settings: settingsInitialState,
          budget: budgetInitialState,
          exchangeRates: generateExchangeRates({
            currencies: [newAccount.currency],
            startAt: subDays(lastWeekday, 10),
            endAt: lastWeekday
          })
        })

        const fetchMockParams = {
          base: store.getState().settings.currency,
          symbols: [newAccount.currency],
          startAt: subDays(newTransaction.createdAt, 10), // Should request the 10 previous days
          endAt: lastWeekday
        }
        const fetchResponse = generateFiatExchangeRatesResponse(fetchMockParams)
        const mockSpy = mockFetch(fetchResponse)

        const id = await store.dispatch(actions.createTransaction(newAccount, newTransaction))
        expect(store.getActions()).toEqual([
          {
            payload: { text: `Fetching exchange rates for ${newAccount.currency}...` },
            type: 'SHOW_SNACKBAR'
          }, {
            payload: fetchResponse.rates,
            type: 'UPDATE_EXCHANGE_RATES'
          }, {
            type: 'CREATE_TRANSACTION',
            payload: {
              ...newTransaction,
              id,
              createdAt: newTransaction.createdAt + 1000,
              amount: { ...newTransaction.amount, localCurrency: null }
            }
          }, {
            // NOTE: UPDATE_ACCOUNT is called but account balance is not changed
            // because test library doesn't actually update the store
            payload: newAccount,
            type: 'UPDATE_ACCOUNT'
          }, {
            type: 'GROUP_BY_INSTITUTION'
          }, {
            type: 'SHOW_SNACKBAR',
            payload: { text: 'Transaction created', status: 'success' }
          }
        ])
        expectExchangeratesApiToHaveBeenCalledWith({ mockSpy, ...fetchMockParams })
      })
    })
  })

  describe('rules with a category', () => {
    it('no rule should do nothing', async () => {
      const byId = { [account.id]: account }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: transactionsInitialState,
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState,
        budget: budgetInitialState
      })
      const id = await store.dispatch(actions.createTransaction(
        account,
        { ...transaction, categoryId }
      ))
      expect(store.getActions()).toEqual([
        {
          type: 'CREATE_TRANSACTION',
          payload: {
            ...transaction,
            id,
            categoryId,
            createdAt: transaction.createdAt + 1000
          }
        }, {
          // NOTE: UPDATE_ACCOUNT is called but account balance is not changed
          // because test library doesn't actually update the store
          payload: account,
          type: 'UPDATE_ACCOUNT'
        }, {
          type: 'GROUP_BY_INSTITUTION'
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: 'Transaction created', status: 'success' }
        }
      ])
    })

    it('rule but no attributes should do nothing', async () => {
      const byId = { [account.id]: account }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: transactionsInitialState,
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState,
        budget: budgetInitialState
      })
      const id = await store.dispatch(actions.createTransaction(
        account,
        { ...transaction, categoryId },
        { rule: {} }
      ))
      expect(store.getActions()).toEqual([
        {
          type: 'CREATE_TRANSACTION',
          payload: {
            ...transaction,
            id,
            categoryId,
            createdAt: transaction.createdAt + 1000
          }
        }, {
          // NOTE: UPDATE_ACCOUNT is called but account balance is not changed
          // because test library doesn't actually update the store
          payload: account,
          type: 'UPDATE_ACCOUNT'
        }, {
          type: 'GROUP_BY_INSTITUTION'
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: 'Transaction created', status: 'success' }
        }
      ])
    })

    it('not applying to existing or future should do nothing', async () => {
      const byId = { [account.id]: account }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: transactionsInitialState,
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState,
        budget: budgetInitialState
      })
      const id = await store.dispatch(actions.createTransaction(
        account,
        { ...transaction, categoryId },
        { rule, applyToExisting: false, applyToFuture: false }
      ))
      expect(store.getActions()).toEqual([
        {
          type: 'CREATE_TRANSACTION',
          payload: {
            ...transaction,
            id,
            categoryId,
            createdAt: transaction.createdAt + 1000
          }
        }, {
          // NOTE: UPDATE_ACCOUNT is called but account balance is not changed
          // because test library doesn't actually update the store
          payload: account,
          type: 'UPDATE_ACCOUNT'
        }, {
          type: 'GROUP_BY_INSTITUTION'
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: 'Transaction created', status: 'success' }
        }
      ])
    })

    it('applying to existing and future should create rule', async () => {
      const byId = { [account.id]: account }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: transactionsInitialState,
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState,
        budget: budgetInitialState
      })
      const id = await store.dispatch(actions.createTransaction(
        account,
        { ...transaction, categoryId },
        { rule, applyToExisting: true, applyToFuture: true }
      ))
      expect(store.getActions()).toEqual([
        {
          type: 'CREATE_TRANSACTION',
          payload: {
            ...transaction,
            id,
            categoryId,
            createdAt: transaction.createdAt + 1000
          }
        }, {
          type: 'CREATE_RULE',
          payload: { ...rule, id: 86 }
        }, {
          // NOTE: UPDATE_ACCOUNT is called but account balance is not changed
          // because test library doesn't actually update the store
          payload: account,
          type: 'UPDATE_ACCOUNT'
        }, {
          type: 'GROUP_BY_INSTITUTION'
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: 'Transaction created', status: 'success' }
        }
      ])
    })

    it('applying to existing but not future should only update existing transactions', async () => {
      const byId = { [account.id]: account }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: { list: [{ ...transaction, id: 1 }], transactionsInitialState },
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState,
        budget: { rules: { [rule.id]: rule }, budgetInitialState }
      })
      const id = await store.dispatch(actions.createTransaction(
        account,
        { ...transaction, categoryId },
        { rule: { ...rule, id: null }, applyToExisting: true, applyToFuture: false }
      ))
      expect(store.getActions()).toEqual([
        {
          type: 'CREATE_TRANSACTION',
          payload: {
            ...transaction,
            id,
            categoryId,
            createdAt: transaction.createdAt + 1000
          }
        }, {
          type: 'UPDATE_TRANSACTIONS',
          payload: {
            1: {
              ...transaction,
              id: 1,
              categoryId
            }
          }
        }, {
          // NOTE: UPDATE_ACCOUNT is called but account balance is not changed
          // because test library doesn't actually update the store
          payload: account,
          type: 'UPDATE_ACCOUNT'
        }, {
          type: 'GROUP_BY_INSTITUTION'
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: 'Transaction created', status: 'success' }
        }
      ])
    })

    it('applying to future but not existing should create rule and not update existing transactions', async () => {
      const byId = { [account.id]: account }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: { list: [{ ...transaction, id: 1 }], transactionsInitialState },
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState,
        budget: { rules: { [rule.id]: rule }, budgetInitialState }
      })
      const id = await store.dispatch(actions.createTransaction(
        account,
        { ...transaction, categoryId },
        { rule: { ...rule, id: null }, applyToExisting: false, applyToFuture: true }
      ))
      expect(store.getActions()).toEqual([
        {
          type: 'CREATE_TRANSACTION',
          payload: {
            ...transaction,
            id,
            categoryId,
            createdAt: transaction.createdAt + 1000
          }
        }, {
          type: 'CREATE_RULE',
          payload: { ...rule, id: 89 }
        }, {
          // NOTE: UPDATE_ACCOUNT is called but account balance is not changed
          // because test library doesn't actually update the store
          payload: account,
          type: 'UPDATE_ACCOUNT'
        }, {
          type: 'GROUP_BY_INSTITUTION'
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: 'Transaction created', status: 'success' }
        }
      ])
    })
  })
})
