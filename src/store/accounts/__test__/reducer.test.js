import accountReducer, { initialState } from '../reducer'
import types from '../types'

jest.mock('uuid/v4', () => jest.fn(() => 1))

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

const account = {
  id: '1',
  name: 'Checking',
  institution: 'TD',
  initialBalance: 1000,
  currentBalance: 1000
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
    expect(accountReducer(initialState, { type, payload: null })).toEqual(initialState)
  })

  it('should handle CREATE_ACCOUNT', () => {
    const type = types.CREATE_ACCOUNT
    const payload = account

    expect(accountReducer(undefined, { type, payload })).toEqual({
      byId: { 1: account },
      byInstitution: {
        TD: { accountIds: ['1'], balance: 1000 }
      }
    })
  })

  it('should handle UPDATE_ACCOUNT', () => {
    const type = types.UPDATE_ACCOUNT
    const state = {
      byId: { 1: account },
      byInstitution: {
        TD: { accountIds: ['1'], balance: 1000 }
      }
    }
    const payload = {
      id: '1',
      name: 'Savings',
      institution: 'BMO',
      initialBalance: 200,
      currentBalance: 200
    }

    expect(accountReducer(state, { type, payload })).toEqual({
      byId: { 1: payload },
      byInstitution: {
        BMO: { accountIds: ['1'], balance: 200 }
      }
    })
  })

  it('should handle DELETE_ACCOUNT', () => {
    const type = types.DELETE_ACCOUNT
    const state = {
      byId: { 1: account },
      byInstitution: {
        TD: { accountIds: ['1'], balance: 1000 }
      }
    }

    expect(accountReducer(state, { type, payload: '1' })).toEqual(initialState)
  })
})
