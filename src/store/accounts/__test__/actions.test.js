import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as actions from '../actions'
import types from '../types'
import { initialState as accountsInitialState } from '../reducer'
import { initialState as settingsInitialState } from '../../settings/reducer'

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

describe('accounts actions', () => {
  describe('loadAccounts', () => {
    it('should load accounts', () => {
      expect(actions.loadAccounts([account])).toEqual({
        type: types.LOAD_ACCOUNTS,
        payload: [account]
      })
    })
  })

  describe('createAccount', () => {
    it('should create a account', () => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        accounts: accountsInitialState
      })

      return store.dispatch(actions.createAccount(account))
        .then(() => {
          expect(store.getActions()).toEqual([
            {
              type: 'CREATE_ACCOUNT',
              payload: { ...account, id: 1 }
            }
          ])
        })
    })
  })

  describe('UpdateAccount', () => {
    it('should update a account', () => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        accounts: [{ ...account, id: 1 }]
      })
      return store.dispatch(actions.updateAccount({ ...account, id: 1, institution: 'TD' }))
        .then(() => {
          expect(store.getActions()).toEqual([
            {
              type: 'UPDATE_ACCOUNT',
              payload: { ...account, id: 1, institution: 'TD' }
            }
          ])
        })
    })
  })

  describe('DeleteAccount', () => {
    it('should delete a account', () => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        accounts: [{ ...account, id: 1 }],
        settings: settingsInitialState
      })
      return store.dispatch(actions.deleteAccount(1))
        .then(() => {
          expect(store.getActions()).toEqual([
            {
              type: 'DELETE_ACCOUNT',
              payload: 1
            }
          ])
        })
    })
  })
})
