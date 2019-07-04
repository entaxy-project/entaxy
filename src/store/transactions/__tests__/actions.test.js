import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as actions from '../actions'
import types from '../types'
import { initialState as accountsInitialState } from '../../accounts/reducer'
import { initialState as transactionsInitialState } from '../reducer'
import { initialState as settingsInitialState } from '../../settings/reducer'
import { initialState as exchangeRatesInitialState } from '../../exchangeRates/reducer'

jest.mock('uuid/v4', () => jest.fn(() => 1))

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

const account = {
  id: 1,
  name: 'Checking',
  institution: 'TD',
  openingBalance: 1000,
  openingBalanceDate: Date.now(),
  currentBalance: 1000
}

const transaction = {
  accountId: 1,
  amount: 1,
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
    it('should create a transaction', async () => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        accounts: accountsInitialState,
        transactions: transactionsInitialState,
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState
      })

      await store.dispatch(actions.createTransaction(account, transaction))
      expect(store.getActions()).toEqual([
        {
          type: 'CREATE_TRANSACTION',
          payload: {
            ...transaction,
            id: 1,
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

  describe('updateTransaction', () => {
    it('should update a transaction', async () => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        accounts: accountsInitialState,
        transactions: { list: [{ ...transaction, id: 1 }], transactionsInitialState },
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState
      })

      await store.dispatch(actions.updateTransaction(account, { ...transaction, id: 1, amount: 100 }))
      expect(store.getActions()).toEqual([
        {
          type: 'UPDATE_TRANSACTION',
          payload: {
            ...transaction,
            id: 1,
            amount: 100,
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
          payload: { text: 'Transaction updated', status: 'success' }
        }
      ])
    })
  })

  describe('deleteTransactions', () => {
    it('should delete a transaction', async () => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        accounts: accountsInitialState,
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
      const mockStore = configureMockStore([thunk])
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
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        accounts: accountsInitialState,
        transactions: { ...transactionsInitialState, list: [{ ...transaction, id: 1 }] },
        settings: {
          portfolioFilters: {
            institution: { Questrade: true },
            account: { RRSP: true }
          }
        }
      })
      const payload = [{
        id: 2,
        accountId: 1,
        amount: 1,
        createdAt: Date.now() + 100000
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

    it('should add transactions but skipAfterChange', async () => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        transactions: { ...transactionsInitialState, list: [{ ...transaction, id: 1 }] },
        settings: {
          portfolioFilters: {
            institution: { Questrade: true },
            account: { RRSP: true }
          }
        }
      })
      const payload = [{
        id: 2,
        accountId: 1,
        amount: 1,
        createdAt: Date.now() + 100000
      }]

      // NOTE: UPDATE_ACCOUNT is called but account balance is not changed
      // because test library doesn't actually update the store
      await store.dispatch(actions.addTransactions(account, payload, { skipAfterChange: true }))
      expect(store.getActions()).toEqual([
        {
          payload,
          type: 'ADD_TRANSACTIONS'
        }
      ])
    })
  })

  describe('getAccountTransactions', () => {
    it('should return empty array if there are no transactions', async () => {
      const transactions = actions.getAccountTransactions({ transactions: transactionsInitialState }, account.id)
      expect(transactions).toEqual([])
    })

    it('should return account transactions only', async () => {
      const transactions = actions.getAccountTransactions({
        transactions: {
          ...transactionsInitialState,
          list: [
            { id: 1, ...transaction },
            { id: 2, accountId: account.id + 1 }
          ]
        }
      }, account.id)
      expect(transactions).toEqual([{ ...transaction, id: 1 }])
    })
  })
})
