import transactionReducer, { initialState } from '../reducer'
import types from '../types'

describe('transaction reducer', () => {
  it('should return initial state', () => {
    expect(transactionReducer(undefined, {})).toEqual(initialState)
  })

  it('should handle LOAD_TRANSACTIONS', () => {
    const type = types.LOAD_TRANSACTIONS
    const payload = [{
      institution: 'Questrade',
      account: 'RRSP',
      type: 'buy',
      ticker: 'VCE.TO',
      shares: '1',
      bookValue: '1',
      createdAt: new Date()
    }]
    expect(transactionReducer(undefined, { type, payload })).toEqual(payload)
  })

  it('should handle LOAD_TRANSACTIONS with no existing transactions', () => {
    const type = types.LOAD_TRANSACTIONS
    const payload = null
    expect(transactionReducer(undefined, { type, payload })).toEqual(initialState)
  })

  it('should handle CREATE_TRANSACTION with no existing transactions', () => {
    const type = types.CREATE_TRANSACTION
    const payload = {
      institution: 'Questrade',
      account: 'RRSP',
      type: 'buy',
      ticker: 'VCE.TO',
      shares: '1',
      bookValue: '1',
      createdAt: new Date()
    }
    expect(transactionReducer(undefined, { type, payload })).toEqual([payload])
  })

  it('should handle CREATE_TRANSACTION with existing transactions', () => {
    const type = types.CREATE_TRANSACTION
    const state = [{
      institution: 'TD',
      account: 'RRSP',
      type: 'buy',
      ticker: 'VCE.TO',
      shares: '2',
      bookValue: '2',
      createdAt: new Date()
    }]
    const payload = {
      institution: 'Questrade',
      account: 'RRSP',
      type: 'buy',
      ticker: 'VCE.TO',
      shares: '1',
      bookValue: '1',
      createdAt: new Date()
    }
    expect(transactionReducer(state, { type, payload })).toEqual([...state, payload])
  })

  it('should handle UPDATE_TRANSACTION', () => {
    const type = types.UPDATE_TRANSACTION
    const state = [{
      id: 1,
      institution: 'TD',
      account: 'RRSP',
      type: 'buy',
      ticker: 'VCE.TO',
      shares: '2',
      bookValue: '2',
      createdAt: new Date()
    }]
    const payload = {
      id: 1,
      institution: 'Questrade',
      account: 'RRSP',
      type: 'buy',
      ticker: 'VCE.TO',
      shares: '1',
      bookValue: '1',
      createdAt: new Date()
    }
    expect(transactionReducer(state, { type, payload })).toEqual([payload])
  })

  it('should handle DELETE_TRANSACTION', () => {
    const type = types.DELETE_TRANSACTION
    const state = [{
      id: 1,
      institution: 'TD',
      account: 'RRSP',
      type: 'buy',
      ticker: 'VCE.TO',
      shares: '2',
      bookValue: '2',
      createdAt: new Date()
    }]
    const payload = state[0].id
    expect(transactionReducer(state, { type, payload })).toEqual([])
  })
})
