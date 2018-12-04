import accountReducer, { initialState } from '../reducer'
import types from '../types'

jest.mock('uuid/v4', () => jest.fn(() => 1))

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

const account = {
  name: 'Checking',
  institution: 'TD',
  initialBalance: 1000
}

describe('account reducer', () => {
  it('should return initial state', () => {
    expect(accountReducer(undefined, {})).toEqual(initialState)
  })

  it('should handle LOAD_ACCOUNTS', () => {
    const type = types.LOAD_ACCOUNTS
    const payload = [account]
    expect(accountReducer(undefined, { type, payload })).toEqual(payload)
  })

  it('should handle LOAD_ACCOUNTS with no existing data', () => {
    const type = types.LOAD_ACCOUNTS
    expect(accountReducer(undefined, { type, payload: null })).toEqual(initialState)
  })

  it('should handle CREATE_ACCOUNT', () => {
    const type = types.CREATE_ACCOUNT
    const payload = account

    expect(accountReducer(undefined, { type, payload })).toEqual([account])
  })

  it('should handle UPDATE_ACCOUNT', () => {
    const type = types.UPDATE_ACCOUNT
    const state = [account]
    const payload = {
      name: 'Savings',
      institution: 'BMO',
      initialBalance: 2000
    }

    expect(accountReducer(state, { type, payload })).toEqual([{
      name: 'Savings',
      institution: 'BMO',
      initialBalance: 2000
    }])
  })

  it('should handle DELETE_ACCOUNT', () => {
    const type = types.DELETE_ACCOUNT
    const state = [{ ...account, id: 1 }]

    expect(accountReducer(state, { type, payload: state[0].id })).toEqual([])
  })
})
