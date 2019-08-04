import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as actions from '../actions'
import types from '../types'
import { initialState as accountsInitialState } from '../../accounts/reducer'
import { initialState as transactionsInitialState } from '../reducer'
import { initialState as settingsInitialState } from '../../settings/reducer'
import { initialState as exchangeRatesInitialState } from '../../exchangeRates/reducer'
import { initialState as budgetInitialState } from '../../budget/reducer'

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
  description: 'Shopping Mart',
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
          type: 'APPLY_EXACT_RULE',
          payload: {
            match: transaction.description,
            rules: {}
          }
        }, {
          // NOTE: the transaction is not actually saved on the moch store so we don't see it here
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

    it('should create a transaction with a category', async () => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        accounts: accountsInitialState,
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
          type: 'CREATE_EXACT_RULE',
          payload: { categoryId, match: transaction.description }
        }, {
          type: 'APPLY_EXACT_RULE',
          payload: {
            match: transaction.description,
            rules: {}
          }
        }, {
          // NOTE: the transaction is not actually saved on the moch store so we don't see it here
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

    it('should update a transaction and add a category', async () => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        accounts: accountsInitialState,
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
          // NOTE: the transaction is not actually saved on the moch store so we don't see it here
          type: 'COUNT_RULE_USAGE',
          payload: [{ ...transaction, id: 1 }]
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

    it('should update a transaction and remove a category', async () => {
      const mockStore = configureMockStore([thunk])
      const categoryId = budgetInitialState.categoryTree[0].options[0].id
      const store = mockStore({
        accounts: accountsInitialState,
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
            categoryId: undefined,
            createdAt: transaction.createdAt + 1000
          }
        }, {
          type: 'DELETE_EXACT_RULE',
          payload: transaction.description
        }, {
          type: 'APPLY_EXACT_RULE',
          payload: {
            match: transaction.description,
            rules: {}
          }
        }, {
          // NOTE: the transaction is not actually saved on the moch store so we don't see it here
          type: 'COUNT_RULE_USAGE',
          payload: [{ ...transaction, id: 1, categoryId }]
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

    it('should update a transaction and change a category', async () => {
      const mockStore = configureMockStore([thunk])
      const categoryId = budgetInitialState.categoryTree[0].options[0].id
      const store = mockStore({
        accounts: accountsInitialState,
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
          // NOTE: the transaction is not actually saved on the moch store so we don't see it here
          type: 'COUNT_RULE_USAGE',
          payload: [{ ...transaction, id: 1, categoryId: 'Old id' }]
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
          // NOTE: the transaction is not actually saved on the moch store so we don't see it here
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
        }, {
          // NOTE: the transaction is not actually saved on the moch store so we don't see it here
          type: 'COUNT_RULE_USAGE',
          payload: [{ ...transaction, id: 1 }]
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
          // NOTE: the transaction is not actually saved on the moch store so we don't see it here
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
        }, {
          // NOTE: the transaction is not actually saved on the moch store so we don't see it here
          type: 'COUNT_RULE_USAGE',
          payload: [{ ...transaction, id: 1 }]
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

  describe('Rules', () => {
    it('should apply an exact rule', async () => {
      const mockStore = configureMockStore([thunk])
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
})
