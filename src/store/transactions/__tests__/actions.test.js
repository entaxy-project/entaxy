import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as actions from '../actions'
import types from '../types'
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
        transactions: [transaction],
        settings: settingsInitialState
      })

      return store.dispatch(actions.createTransaction(transaction))
        .then(() => {
          expect(store.getActions()).toEqual([
            {
              type: 'CREATE_TRANSACTION',
              payload: { ...transaction, id: 1 }
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

  describe('UpdateTransaction', () => {
    it('should update a transaction', () => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        transactions: [{ ...transaction, id: 1 }],
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
  describe('DeleteTransaction', () => {
    it('should delete a transaction', () => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        transactions: [{ ...transaction, id: 1 }],
        settings: settingsInitialState
      })
      return store.dispatch(actions.deleteTransaction({ id: 1 }))
        .then(() => {
          expect(store.getActions()).toEqual([
            {
              type: 'DELETE_TRANSACTION',
              payload: { id: 1 }
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
})
