import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as actions from '../actions'
import types from '../types'
import { initialState as transactionsInitialState } from '../reducer'
import { initialState as settingsInitialState } from '../../settings/reducer'

jest.mock('uuid/v4', () => jest.fn(() => 1))

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

const transaction = {
  institution: 'Questrade',
  account: 'RRSP',
  type: 'buy',
  ticker: 'VCE.TO',
  shares: '1',
  bookValue: '1',
  createdAt: new Date()
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
    it('should create a transaction', () => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        transactions: transactionsInitialState,
        settings: settingsInitialState
      })

      return store.dispatch(actions.createTransaction(transaction))
        .then(() => {
          expect(store.getActions()).toEqual([
            {
              type: 'CREATE_TRANSACTION',
              payload: { ...transaction, id: 1 }
            }
          ])
        })
    })
  })

  describe('UpdateTransaction', () => {
    it('should update a transaction', () => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        transactions: { list: [{ ...transaction, id: 1 }], transactionsInitialState },
        settings: settingsInitialState
      })
      return store.dispatch(actions.updateTransaction({ ...transaction, id: 1, institution: 'TD' }))
        .then(() => {
          expect(store.getActions()).toEqual([
            {
              type: 'UPDATE_TRANSACTION',
              payload: { ...transaction, id: 1, institution: 'TD' }
            },
            {
              payload: {
                filterName: 'institution',
                options: { Questrade: true }
              },
              type: 'CREATE_PORTFOLIO_FILTERS'
            },
            {
              payload: {
                filterName: 'account',
                options: { RRSP: true }
              },
              type: 'CREATE_PORTFOLIO_FILTERS'
            }
          ])
        })
    })
  })

  describe('DeleteTransactions', () => {
    it('should delete a transaction', () => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        transactions: { list: [{ ...transaction, id: 1 }], transactionsInitialState },
        settings: settingsInitialState
      })
      return store.dispatch(actions.deleteTransactions([1]))
        .then(() => {
          expect(store.getActions()).toEqual([
            {
              type: 'DELETE_TRANSACTIONS',
              payload: [1]
            },
            {
              payload: {
                filterName: 'institution',
                options: { Questrade: true }
              },
              type: 'CREATE_PORTFOLIO_FILTERS'
            },
            {
              payload: {
                filterName: 'account',
                options: { RRSP: true }
              },
              type: 'CREATE_PORTFOLIO_FILTERS'
            }
          ])
        })
    })
  })

  describe('addTransactions', () => {
    it('should add transactions to the existing ones', () => {
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
        institution: 'TD',
        account: 'TFSA',
        type: 'buy',
        ticker: 'VCE.TO',
        shares: '1',
        bookValue: '1',
        createdAt: new Date()
      }]

      return store.dispatch(actions.addTransactions(payload))
        .then(() => {
          expect(store.getActions()).toEqual([
            {
              type: 'ADD_TRANSACTIONS',
              payload
            }
          ])
        })
    })
  })

  describe('updateSortBy', () => {
    it('should update sorting options', () => {
      expect(actions.updateSortBy('account', 'ASC')).toEqual({
        type: types.UPDATE_SORT_BY,
        payload: { sortBy: 'account', sortDirection: 'ASC' }
      })
    })
  })
})
