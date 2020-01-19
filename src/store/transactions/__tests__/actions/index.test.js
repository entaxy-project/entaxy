import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { subDays, startOfYesterday } from 'date-fns'
import * as actions from '../../actions'
import types from '../../types'
import { groupByInstitution } from '../../../accounts/reducer'
import { initialState as transactionsInitialState } from '../../reducer'
import { initialState as settingsInitialState } from '../../../settings/reducer'
import { initialState as exchangeRatesInitialState } from '../../../exchangeRates/reducer'
import { getLastWeekday } from '../../../exchangeRates/actions'
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

describe('transactions actions', () => {
  describe('loadTransactions', () => {
    it('should load transactions', () => {
      expect(actions.loadTransactions([transaction])).toEqual({
        type: types.LOAD_TRANSACTIONS,
        payload: [transaction]
      })
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
      expect(store.getActions()).toEqual([{ payload, type: 'ADD_TRANSACTIONS' }])
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
