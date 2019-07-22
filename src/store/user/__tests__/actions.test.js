import { UserSession, Person } from 'blockstack'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as storage from '../../blockstackStorage'
import { initialState } from '../reducer'
import { initialState as settingsInitialState } from '../../settings/reducer'
import { initialState as accountsInitialState } from '../../accounts/reducer'
import { initialState as transactionsInitialState } from '../../transactions/reducer'
import { initialState as exchangeRatesInitialState } from '../../exchangeRates/reducer'
import { initialState as budgetInitialState } from '../../budget/reducer'
import * as actions from '../actions'
import types from '../types'
import { blockstackUserSession, blockstackPerson } from '../../../../mocks/BlockstackMock'

jest.mock('blockstack')
UserSession.mockImplementation(() => blockstackUserSession)
Person.mockImplementation(() => blockstackPerson)

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

describe('user actions', () => {
  const dispatch = jest.fn()

  afterEach(() => {
    dispatch.mockClear()
  })

  describe('saveLoginData', () => {
    it('signed in user should load the profile', (done) => {
      blockstackUserSession.isUserSignedIn.mockReturnValue(true)
      const getState = () => ({ user: {} })

      actions.loadUserData()(dispatch, getState).then(() => {
        expect(dispatch).toHaveBeenCalledWith({
          type: types.SAVE_LOGIN_DATA,
          payload: {
            isLoginPending: false,
            isAuthenticatedWith: 'blockstack',
            name: 'mocked name',
            pictureUrl: 'mocked url',
            username: 'mocked username'
          }
        })
        expect(blockstackUserSession.isUserSignedIn).toHaveBeenCalled()
        done()
      })
    })

    it('logged out user should not call anything', () => {
      blockstackUserSession.isUserSignedIn.mockReturnValue(false)
      const getState = () => ({ user: { isLoading: false } })

      actions.loadUserData()(dispatch, getState)
      expect(dispatch).not.toHaveBeenCalledWith({ type: types.DATA_IS_LOADING, payload: false })
      expect(blockstackUserSession.isUserSignedIn).toHaveBeenCalled()
    })

    it('should not call anything if data is already loading', () => {
      blockstackUserSession.isUserSignedIn.mockReturnValue(true)
      const getState = () => ({ user: { isLoading: true } })

      actions.loadUserData()(dispatch, getState)
      expect(dispatch).not.toHaveBeenCalledWith({ type: types.DATA_IS_LOADING, payload: false })
      expect(blockstackUserSession.isUserSignedIn).not.toHaveBeenCalled()
    })
  })

  describe('loginAs', () => {
    it('should login as blockstack', () => {
      actions.loginAs('blockstack')
      expect(blockstackUserSession.redirectToSignIn).toHaveBeenCalled()
    })

    it('should login as guest', () => {
      actions.loginAs('guest')(dispatch)
      expect(dispatch).toHaveBeenCalledWith({
        type: types.SAVE_LOGIN_DATA,
        payload: {
          isLoginPending: false,
          isAuthenticatedWith: 'guest',
          name: 'Guest user',
          pictureUrl: null,
          username: 'guest'
        }
      })
      expect(blockstackUserSession.redirectToSignIn).not.toHaveBeenCalled()
    })
  })

  it('resetState should delete all data', async () => {
    const mockStore = configureMockStore([thunk])
    const store = mockStore({
      settings: settingsInitialState
    })

    store.dispatch(actions.resetState())
    expect(store.getActions()).toEqual([
      {
        type: 'LOAD_SETTINGS',
        payload: settingsInitialState
      },
      {
        type: 'LOAD_ACCOUNTS',
        payload: accountsInitialState
      },
      {
        type: 'LOAD_TRANSACTIONS',
        payload: transactionsInitialState
      },
      {
        type: 'LOAD_EXCHANGE_RATES',
        payload: exchangeRatesInitialState
      },
      {
        type: 'LOAD_BUDGET',
        payload: budgetInitialState
      }
    ])
  })

  it('userLogout should sign the user out', async () => {
    await actions.userLogout()(dispatch)
    expect(blockstackUserSession.signUserOut).toHaveBeenCalled()
    expect(dispatch).toBeCalledTimes(2)
    expect(dispatch).toBeCalledWith({ type: types.USER_LOGOUT })
  })

  it('userLoginError should sign the user out', () => {
    expect(actions.userLoginError({ message: 'Error' })).toEqual({
      type: types.USER_LOGIN_ERROR,
      payload: { message: 'Error' }
    })
  })

  it('saves the current state', () => {
    const saveStorageSpy = jest.spyOn(storage, 'saveState').mockImplementation(() => {})
    actions.saveState()
    expect(saveStorageSpy).toHaveBeenCalled()
  })

  describe('handleBlockstackLogin', () => {
    it('signs the user in', (done) => {
      jest.spyOn(storage, 'loadState').mockImplementation(() => Promise.resolve({}))
      blockstackUserSession.handlePendingSignIn.mockReturnValue(Promise.resolve())
      blockstackUserSession.isUserSignedIn.mockReturnValue(true)

      const mockStore = configureMockStore([thunk])
      const store = mockStore({ user: { ...initialState, isLoading: false } })

      store.dispatch(actions.handleBlockstackLogin())
        .then(() => {
          expect(store.getActions()).toEqual([
            { type: 'SHOW_OVERLAY', payload: 'Loading data from Blockstack...' },
            {
              type: 'SAVE_LOGIN_DATA',
              payload: {
                isLoginPending: false,
                isAuthenticatedWith: 'blockstack',
                username: 'mocked username',
                name: 'mocked name',
                pictureUrl: 'mocked url'
              }
            },
            { type: 'LOAD_SETTINGS', payload: undefined },
            { type: 'LOAD_ACCOUNTS', payload: undefined },
            { type: 'LOAD_TRANSACTIONS', payload: undefined },
            { type: 'LOAD_EXCHANGE_RATES', payload: undefined },
            {
              type: 'LOAD_BUDGET',
              payload: {
                categories: budgetInitialState.categories,
                colours: budgetInitialState.colours
              }
            },
            { type: 'HIDE_OVERLAY' }
          ])
          done()
        })
    })

    it('fails to sign in', (done) => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({ initialState })

      blockstackUserSession.handlePendingSignIn.mockReturnValue(Promise.reject(new Error('Error message')))
      return store.dispatch(actions.handleBlockstackLogin())
        .then(() => {
          expect(store.getActions()).toEqual([
            {
              type: 'USER_LOGIN_ERROR',
              payload: new Error('Error message')
            }
          ])
          done()
        })
    })
  })
})
