import transactionReducer, { initialState } from '../reducer'
import types from '../types'

const transaction = {
  institution: 'Questrade',
  account: 'RRSP',
  type: 'buy',
  ticker: 'VCE.TO',
  shares: '1',
  bookValue: '1',
  createdAt: new Date()
}

describe('transaction reducer', () => {
  it('should return initial state', () => {
    expect(transactionReducer(undefined, {})).toEqual(initialState)
  })

  it('should handle LOAD_TRANSACTIONS', () => {
    const type = types.LOAD_TRANSACTIONS
    const payload = [transaction]
    expect(transactionReducer(undefined, { type, payload })).toEqual(payload)
  })

  it('should handle LOAD_TRANSACTIONS with no existing transactions', () => {
    const type = types.LOAD_TRANSACTIONS
    const payload = null
    expect(transactionReducer(undefined, { type, payload })).toEqual(initialState)
  })

  it('should handle CREATE_TRANSACTION with no existing transactions', () => {
    const type = types.CREATE_TRANSACTION
    const payload = transaction
    expect(transactionReducer(undefined, { type, payload })).toEqual({ ...initialState, list: [payload] })
  })

  it('should handle CREATE_TRANSACTION with existing transactions', () => {
    const type = types.CREATE_TRANSACTION
    const state = {
      ...initialState,
      list: [{
        institution: 'TD',
        account: 'RRSP',
        type: 'buy',
        ticker: 'VCE.TO',
        shares: '2',
        bookValue: '2',
        createdAt: new Date()
      }]
    }
    const payload = transaction
    expect(transactionReducer(state, { type, payload })).toEqual({ ...state, list: [...state.list, payload] })
  })

  it('should handle UPDATE_TRANSACTION', () => {
    const type = types.UPDATE_TRANSACTION
    const state = {
      ...initialState,
      list: [{ ...transaction, id: 1, shares: '2', bookValue: '2'}]
    }
    const payload = { ...transaction, id: 1 }
    expect(transactionReducer(state, { type, payload })).toEqual({ ...state, list: [payload] })
  })

  it('should handle DELETE_TRANSACTIONS', () => {
    const type = types.DELETE_TRANSACTIONS
    const state = {
      ...initialState,
      list: [transaction]
    }
    const payload = [state.list[0].id]
    expect(transactionReducer(state, { type, payload })).toEqual(initialState)
  })

  it('should handle ADD_TRANSACTIONS to existing transactions', () => {
    const type = types.ADD_TRANSACTIONS
    const state = {
      ...initialState,
      list: [{
        id: 1,
        institution: 'TD',
        account: 'RRSP',
        type: 'buy',
        ticker: 'VCE.TO',
        shares: '2',
        bookValue: '2',
        createdAt: new Date()
      }]
    }
    const payload = [{
      id: 2,
      institution: 'Questrade',
      account: 'RRSP',
      type: 'buy',
      ticker: 'VCE.TO',
      shares: '2',
      bookValue: '2',
      createdAt: new Date()
    }, {
      id: 3,
      institution: 'Questrade',
      account: 'RRSP',
      type: 'buy',
      ticker: 'VCE.TO',
      shares: '3',
      bookValue: '3',
      createdAt: new Date()
    }]
    expect(transactionReducer(state, { type, payload })).toEqual({
      ...state,
      list: [...state.list, ...payload]
    })
  })

  it('should handle UPDATE_SORT_BY', () => {
    const type = types.UPDATE_SORT_BY
    const payload = {
      sortBy: 'account',
      sortDirection: 'ASC'

    }
    expect(transactionReducer(initialState, { type, payload })).toEqual({ ...initialState, ...payload })
  })
})
