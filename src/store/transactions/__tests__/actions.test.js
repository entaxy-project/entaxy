import Big from 'big.js'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { subDays, startOfYesterday } from 'date-fns'
import * as actions from '../actions'
import types from '../types'
import { groupByInstitution } from '../../accounts/reducer'
import { initialState as transactionsInitialState } from '../reducer'
import { initialState as settingsInitialState } from '../../settings/reducer'
import { initialState as exchangeRatesInitialState } from '../../exchangeRates/reducer'
import { getLastWeekday } from '../../exchangeRates/actions'
import { initialState as budgetInitialState } from '../../budget/reducer'
import { fiatCurrencies } from '../../../data/currencies'
import {
  mockFetch,
  expectExchangeratesApiToHaveBeenCalledWith,
  generateFiatExchangeRatesResponse,
  generateExchangeRates
} from '../../../setupTests'

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

describe('transactions actions', () => {
  describe('loadTransactions', () => {
    it('should load transactions', () => {
      expect(actions.loadTransactions([transaction])).toEqual({
        type: types.LOAD_TRANSACTIONS,
        payload: [transaction]
      })
    })
  })

  describe('createTransaction', () => {
    describe('where currency is the same as system currency', () => {
      it('should create a transaction without a category', async () => {
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

      it('should create a transaction with a category and create a rule', async () => {
        const byId = { [account.id]: account }
        const store = mockStore({
          accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
          transactions: transactionsInitialState,
          settings: settingsInitialState,
          exchangeRates: exchangeRatesInitialState,
          budget: budgetInitialState
        })
        const categoryId = budgetInitialState.categoryTree[0].options[0].id
        const id = await store.dispatch(actions.createTransaction(
          account,
          { ...transaction, categoryId },
          { createAndApplyRule: true }
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
            type: 'CREATE_EXACT_RULE',
            payload: { categoryId, match: transaction.description }
          }, {
            type: 'APPLY_EXACT_RULE',
            payload: {
              match: transaction.description,
              rules: {}
            }
          }, {
            // NOTE: the transaction is not actually saved on the mock store so we don't see it here
            type: 'COUNT_RULE_USAGE',
            payload: []
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

      it('should create a transaction with a category and not create a rule', async () => {
        const byId = { [account.id]: account }
        const store = mockStore({
          accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
          transactions: transactionsInitialState,
          settings: settingsInitialState,
          exchangeRates: exchangeRatesInitialState,
          budget: budgetInitialState
        })
        const categoryId = budgetInitialState.categoryTree[0].options[0].id
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
    })

    describe('where currency different than system currency', () => {
      it('should create a transaction and use existing exchange rates', async () => {
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

      it('should create a transaction and fetch exchange rates', async () => {
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

  describe('updateTransaction', () => {
    it('should update a transaction amount', async () => {
      const byId = { [account.id]: account }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: { list: [{ ...transaction, id: 1 }], transactionsInitialState },
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState
      })

      await store.dispatch(actions.updateTransaction(account, {
        ...transaction,
        id: 1,
        amount: {
          accountCurrency: 10
        }
      }))
      expect(store.getActions()).toEqual([
        {
          type: 'UPDATE_TRANSACTION',
          payload: {
            ...transaction,
            id: 1,
            amount: {
              accountCurrency: 10,
              localCurrency: 10
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
          payload: { text: 'Transaction updated', status: 'success' }
        }
      ])
    })

    it('should update a transaction createdAt and fetch new exchange rates', async () => {
      const newAccount = { ...account, currency: Object.keys(fiatCurrencies)[0] }
      const newTransaction = {
        ...transaction,
        id: 1,
        createdAt: subDays(startOfYesterday(), 100).getTime()
      }
      const byId = { [newAccount.id]: newAccount }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: { list: [{ ...transaction, id: 1 }] },
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState
      })
      const fetchMockParams = {
        base: store.getState().settings.currency,
        symbols: [newAccount.currency],
        startAt: subDays(newTransaction.createdAt, 10), // Should request the 10 previous days
        endAt: getLastWeekday()
      }
      const fetchResponse = generateFiatExchangeRatesResponse(fetchMockParams)
      const mockSpy = mockFetch(fetchResponse)

      await store.dispatch(actions.updateTransaction(newAccount, newTransaction))
      expect(store.getActions()).toEqual([
        {
          payload: { text: `Fetching exchange rates for ${newAccount.currency}...` },
          type: 'SHOW_SNACKBAR'
        }, {
          payload: fetchResponse.rates,
          type: 'UPDATE_EXCHANGE_RATES'
        }, {
          // NOTE: UPDATE_EXCHANGE_RATES is called but the mock store doesn't actually save anything
          type: 'UPDATE_TRANSACTION',
          payload: {
            ...newTransaction,
            id: 1,
            createdAt: newTransaction.createdAt + 1000,
            amount: {
              ...newTransaction.amount,
              localCurrency: null
            }
          }
        }, {
          // NOTE: UPDATE_ACCOUNT is called but the mock store doesn't actually save anything
          payload: newAccount,
          type: 'UPDATE_ACCOUNT'
        }, {
          type: 'GROUP_BY_INSTITUTION'
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: 'Transaction updated', status: 'success' }
        }
      ])
      expectExchangeratesApiToHaveBeenCalledWith({ mockSpy, ...fetchMockParams })
    })

    it('should update a transaction and add a category and create a rule', async () => {
      const byId = { [account.id]: account }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: { list: [{ ...transaction, id: 1 }], transactionsInitialState },
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState,
        budget: budgetInitialState
      })
      const categoryId = budgetInitialState.categoryTree[0].options[0].id
      expect(transaction.category).toBeUndefined()
      await store.dispatch(actions.updateTransaction(
        account,
        {
          ...transaction,
          id: 1,
          categoryId
        },
        { createAndApplyRule: true }
      ))
      expect(store.getActions()).toEqual([
        {
          type: 'UPDATE_TRANSACTION',
          payload: {
            ...transaction,
            id: 1,
            categoryId
          }
        }, {
          type: 'CREATE_EXACT_RULE',
          payload: { categoryId, match: transaction.description }
        }, {
          type: 'APPLY_EXACT_RULE',
          payload: {
            match: transaction.description,
            rules: {}
          }
        }, {
          // NOTE: the transaction is not actually saved on the mock store so we don't see it here
          type: 'COUNT_RULE_USAGE',
          payload: [{ ...transaction, id: 1 }]
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: 'Transaction updated', status: 'success' }
        }
      ])
    })

    it('should update a transaction and add a category and not create a rule', async () => {
      const byId = { [account.id]: account }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: { list: [{ ...transaction, id: 1 }], transactionsInitialState },
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState,
        budget: budgetInitialState
      })
      const categoryId = budgetInitialState.categoryTree[0].options[0].id
      expect(transaction.category).toBeUndefined()
      await store.dispatch(actions.updateTransaction(
        account,
        {
          ...transaction,
          id: 1,
          categoryId
        }
      ))
      expect(store.getActions()).toEqual([
        {
          type: 'UPDATE_TRANSACTION',
          payload: {
            ...transaction,
            id: 1,
            categoryId
          }
        }, {
          // NOTE: the transaction is not actually saved on the mock store so we don't see it here
          type: 'COUNT_RULE_USAGE',
          payload: [{ ...transaction, id: 1 }]
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: 'Transaction updated', status: 'success' }
        }
      ])
    })

    it('should update a transaction and remove a category and create a rule', async () => {
      const categoryId = budgetInitialState.categoryTree[0].options[0].id
      const byId = { [account.id]: account }
      const existingRules = {
        description: budgetInitialState.categoryTree[0].options[0]
      }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: { list: [{ ...transaction, id: 1, categoryId }], transactionsInitialState },
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState,
        budget: {
          ...budgetInitialState,
          rules: existingRules
        }
      })

      await store.dispatch(actions.updateTransaction(
        account,
        {
          ...transaction,
          id: 1,
          categoryId: undefined
        },
        { createAndApplyRule: true }
      ))
      expect(store.getActions()).toEqual([
        {
          type: 'UPDATE_TRANSACTION',
          payload: {
            ...transaction,
            id: 1,
            categoryId: undefined
          }
        }, {
          type: 'DELETE_EXACT_RULE',
          payload: transaction.description
        }, {
          type: 'APPLY_EXACT_RULE',
          payload: {
            match: transaction.description,
            rules: existingRules // This should have the new rule but the mock store doesn't save anything
          }
        }, {
          // NOTE: the transaction is not actually saved on the mock store so we don't see it here
          type: 'COUNT_RULE_USAGE',
          payload: [{ ...transaction, id: 1, categoryId }]
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: 'Transaction updated', status: 'success' }
        }
      ])
    })

    it('should update a transaction and remove a category and not create a rule', async () => {
      const categoryId = budgetInitialState.categoryTree[0].options[0].id
      const byId = { [account.id]: account }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: { list: [{ ...transaction, id: 1, categoryId }], transactionsInitialState },
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState,
        budget: budgetInitialState
      })

      await store.dispatch(actions.updateTransaction(
        account,
        {
          ...transaction,
          id: 1,
          categoryId: undefined
        }
      ))
      expect(store.getActions()).toEqual([
        {
          type: 'UPDATE_TRANSACTION',
          payload: {
            ...transaction,
            id: 1,
            categoryId: undefined
          }
        }, {
          // NOTE: the transaction is not actually saved on the mock store so we don't see it here
          type: 'COUNT_RULE_USAGE',
          payload: [{ ...transaction, id: 1, categoryId }]
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: 'Transaction updated', status: 'success' }
        }
      ])
    })

    it('should update a transaction and change a category and create a rule', async () => {
      const categoryId = budgetInitialState.categoryTree[0].options[0].id
      const byId = { [account.id]: account }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: { list: [{ ...transaction, id: 1, categoryId: 'Old id' }], transactionsInitialState },
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState,
        budget: budgetInitialState
      })

      await store.dispatch(actions.updateTransaction(
        account,
        {
          ...transaction,
          id: 1,
          categoryId
        },
        { createAndApplyRule: true }
      ))
      expect(store.getActions()).toEqual([
        {
          type: 'UPDATE_TRANSACTION',
          payload: {
            ...transaction,
            id: 1,
            categoryId
          }
        }, {
          type: 'CREATE_EXACT_RULE',
          payload: { categoryId, match: transaction.description }
        }, {
          type: 'APPLY_EXACT_RULE',
          payload: {
            match: transaction.description,
            rules: {}
          }
        }, {
          // NOTE: the transaction is not actually saved on the mock store so we don't see it here
          type: 'COUNT_RULE_USAGE',
          payload: [{ ...transaction, id: 1, categoryId: 'Old id' }]
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: 'Transaction updated', status: 'success' }
        }
      ])
    })

    it('should update a transaction and change a category and not create a rule', async () => {
      const categoryId = budgetInitialState.categoryTree[0].options[0].id
      const byId = { [account.id]: account }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: { list: [{ ...transaction, id: 1, categoryId: 'Old id' }], transactionsInitialState },
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState,
        budget: budgetInitialState
      })

      await store.dispatch(actions.updateTransaction(
        account,
        {
          ...transaction,
          id: 1,
          categoryId
        }
      ))
      expect(store.getActions()).toEqual([
        {
          type: 'UPDATE_TRANSACTION',
          payload: {
            ...transaction,
            id: 1,
            categoryId
          }
        }, {
          // NOTE: the transaction is not actually saved on the mock store so we don't see it here
          type: 'COUNT_RULE_USAGE',
          payload: [{ ...transaction, id: 1, categoryId: 'Old id' }]
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: 'Transaction updated', status: 'success' }
        }
      ])
    })
  })

  describe('deleteTransactions', () => {
    it('should delete a transaction', async () => {
      const byId = { [account.id]: account }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: { list: [{ ...transaction, id: 1 }], transactionsInitialState },
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState
      })

      // NOTE: UPDATE_ACCOUNT is called but account balance is not changed
      // because test library doesn't actually update the store
      await store.dispatch(actions.deleteTransactions(account, [1]))
      expect(store.getActions()).toEqual([
        {
          type: 'DELETE_TRANSACTIONS',
          payload: [1]
        }, {
          // NOTE: the transaction is not actually saved on the mock store so we don't see it here
          type: 'COUNT_RULE_USAGE',
          payload: [{ ...transaction, id: 1 }]
        }, {
          payload: account,
          type: 'UPDATE_ACCOUNT'
        }, {
          type: 'GROUP_BY_INSTITUTION'
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: '1 transaction deleted', status: 'success' }
        }
      ])
    })

    it('should delete a transaction but skipAfterChange', async () => {
      const store = mockStore({
        transactions: { list: [{ ...transaction, id: 1 }], transactionsInitialState },
        settings: settingsInitialState
      })

      // NOTE: UPDATE_ACCOUNT is called but account balance is not changed
      // because test library doesn't actually update the store
      await store.dispatch(actions.deleteTransactions(account, [1], { skipAfterChange: true }))
      expect(store.getActions()).toEqual([
        {
          type: 'DELETE_TRANSACTIONS',
          payload: [1]
        }, {
          // NOTE: the transaction is not actually saved on the mock store so we don't see it here
          type: 'COUNT_RULE_USAGE',
          payload: [{ ...transaction, id: 1 }]
        }
      ])
    })
  })

  describe('addTransactions', () => {
    it('should add transactions to the existing ones', async () => {
      const byId = { [account.id]: account }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: { ...transactionsInitialState, list: [{ ...transaction, id: 1 }] },
        settings: settingsInitialState,
        exchangeRates: generateExchangeRates({
          currencies: [account.currency],
          startAt: subDays(startOfYesterday(), 10),
          endAt: startOfYesterday()
        })
      })
      const payload = [{
        id: 2,
        accountId: 1,
        amount: { accountCurrency: 1 },
        createdAt: Date.now()
      }]

      // NOTE: UPDATE_ACCOUNT is called but account balance is not changed
      // because test library doesn't actually update the store
      await store.dispatch(actions.addTransactions(account, payload))
      expect(store.getActions()).toEqual([
        {
          type: 'ADD_TRANSACTIONS',
          payload
        }, {
          // NOTE: the transaction is not actually saved on the mock store so we don't see it here
          type: 'COUNT_RULE_USAGE',
          payload: [{ ...transaction, id: 1 }]
        }, {
          payload: account,
          type: 'UPDATE_ACCOUNT'
        }, {
          type: 'GROUP_BY_INSTITUTION'
        }
      ])
    })

    it('should add transactions and fetch exchange rates', async () => {
      const lastWeekday = getLastWeekday()
      const newAccount = { ...account, currency: Object.keys(fiatCurrencies)[0] }
      const newTransactions = [{
        id: 2,
        accountId: 1,
        amount: { accountCurrency: 1 },
        createdAt: subDays(lastWeekday, 99).getTime()
      }, {
        id: 3,
        accountId: 1,
        amount: { accountCurrency: 2 },
        createdAt: subDays(lastWeekday, 100).getTime()
      }]
      const byId = { [newAccount.id]: newAccount }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: { ...transactionsInitialState, list: [{ ...transaction, id: 1 }] },
        settings: settingsInitialState,
        exchangeRates: generateExchangeRates({
          currencies: [newAccount.currency],
          startAt: subDays(lastWeekday, 10),
          endAt: lastWeekday
        })
      })
      const fetchMockParams = {
        base: store.getState().settings.currency,
        symbols: [newAccount.currency],
        startAt: subDays(newTransactions[1].createdAt, 10), // Should request the 10 previous days
        endAt: lastWeekday
      }
      const fetchResponse = generateFiatExchangeRatesResponse(fetchMockParams)
      const mockSpy = mockFetch(fetchResponse)

      // NOTE: UPDATE_ACCOUNT is called but account balance is not changed
      // because test library doesn't actually update the store
      await store.dispatch(actions.addTransactions(newAccount, newTransactions))
      expect(store.getActions()).toEqual([
        {
          payload: { text: `Fetching exchange rates for ${newAccount.currency}...` },
          type: 'SHOW_SNACKBAR'
        }, {
          payload: fetchResponse.rates,
          type: 'UPDATE_EXCHANGE_RATES'
        }, {
          type: 'ADD_TRANSACTIONS',
          payload: newTransactions
        }, {
          // NOTE: the transaction is not actually saved on the mock store so we don't see it here
          type: 'COUNT_RULE_USAGE',
          payload: [{ ...transaction, id: 1 }]
        }, {
          payload: newAccount,
          type: 'UPDATE_ACCOUNT'
        }, {
          type: 'GROUP_BY_INSTITUTION'
        }
      ])
      expectExchangeratesApiToHaveBeenCalledWith({ mockSpy, ...fetchMockParams })
    })

    it('should add transactions and use existing exchange rates', async () => {
      const newAccount = { ...account, currency: Object.keys(fiatCurrencies)[0] }
      const newTransactions = [{
        id: 2,
        accountId: 1,
        amount: { accountCurrency: 1 },
        createdAt: startOfYesterday().getTime()
      }, {
        id: 3,
        accountId: 1,
        amount: { accountCurrency: 2 },
        createdAt: subDays(startOfYesterday(), 1).getTime()
      }]
      const byId = { [newAccount.id]: newAccount }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: { ...transactionsInitialState, list: [{ ...transaction, id: 1 }] },
        settings: settingsInitialState,
        exchangeRates: generateExchangeRates({
          currencies: [newAccount.currency],
          startAt: subDays(startOfYesterday(), 10),
          endAt: startOfYesterday()
        })
      })
      const mockSpy = mockFetch()

      // NOTE: UPDATE_ACCOUNT is called but account balance is not changed
      // because test library doesn't actually update the store
      await store.dispatch(actions.addTransactions(newAccount, newTransactions))
      expect(store.getActions()).toEqual([
        {
          type: 'ADD_TRANSACTIONS',
          payload: newTransactions
        }, {
          // NOTE: the transaction is not actually saved on the mock store so we don't see it here
          type: 'COUNT_RULE_USAGE',
          payload: [{ ...transaction, id: 1 }]
        }, {
          payload: newAccount,
          type: 'UPDATE_ACCOUNT'
        }, {
          type: 'GROUP_BY_INSTITUTION'
        }
      ])
      expect(mockSpy).not.toHaveBeenCalled()
    })

    it('should add transactions but don\'t updateAccountAndExchangeRates', async () => {
      const byId = { [account.id]: account }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: { ...transactionsInitialState, list: [{ ...transaction, id: 1 }] },
        settings: settingsInitialState,
        exchangeRates: {}
      })
      const payload = [{
        id: 2,
        accountId: 1,
        amount: { accountCurrency: 1 },
        createdAt: Date.now() + 100000
      }]

      // NOTE: UPDATE_ACCOUNT is called but account balance is not changed
      // because test library doesn't actually update the store
      await store.dispatch(actions.addTransactions(account, payload, {
        updateAccountAndExchangeRates: false
      }))
      expect(store.getActions()).toEqual([
        {
          payload,
          type: 'ADD_TRANSACTIONS'
        }, {
          // NOTE: the transaction is not actually saved on the mock store so we don't see it here
          type: 'COUNT_RULE_USAGE',
          payload: [{ ...transaction, id: 1 }]
        }
      ])
    })
  })

  describe('getAccountTransactions', () => {
    it('should return empty array if there are no transactions', async () => {
      const store = mockStore({
        transactions: transactionsInitialState
      })
      const transactions = store.dispatch(actions.getAccountTransactions(account.id))
      expect(transactions).toEqual([])
    })

    it('should return account transactions only', async () => {
      const store = mockStore({
        transactions: {
          ...transactionsInitialState,
          list: [
            { id: 1, ...transaction },
            { id: 2, accountId: account.id + 1 }
          ]
        }
      })
      const transactions = store.dispatch(actions.getAccountTransactions(account.id))
      expect(transactions).toEqual([{ ...transaction, id: 1 }])
    })
  })

  describe('Rules', () => {
    it('should apply an exact rule', async () => {
      const store = mockStore({
        transactions: transactionsInitialState
      })
      const match = 'Shopping Mart'
      await store.dispatch(actions.applyExactRule({ match, rules: {} }))
      expect(store.getActions()).toEqual([{
        type: 'APPLY_EXACT_RULE',
        payload: {
          match,
          rules: {}
        }
      }])
    })
  })

  describe('updateTransactionFieldIfMatched', () => {
    it('should update categoryIds', async () => {
      const store = mockStore({})
      const payload = { fieldName: 'categoryId', values: [1], newValue: undefined }
      await store.dispatch(actions.updateTransactionFieldIfMatched(payload))
      expect(store.getActions()).toEqual([{
        type: 'UPATE_TRANSACTION_FIELD_IF_MATCHED',
        payload
      }])
    })
  })

  it('should filterByErrors', async () => {
    expect(actions.filterByErrors({ errors: ['some error'] })).toBe(true)
    expect(actions.filterByErrors({ errors: [] })).toBe(false)
    expect(actions.filterByErrors({ })).toBe(false)
  })

  it('should filterByDuplicates', async () => {
    expect(actions.filterByDuplicates({ duplicate: 'something' })).toBe(true)
    expect(actions.filterByDuplicates({ })).toBe(false)
  })
})
