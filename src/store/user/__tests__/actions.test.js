import * as blockstack from 'blockstack'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as storage from '../../blockstackStorage'
import { initialState } from '../reducer'
import { initialState as settingsInitialState } from '../../settings/reducer'
import { initialState as accountsInitialState } from '../../accounts/reducer'
import { initialState as transactionsInitialState } from '../../transactions/reducer'
import { initialState as exchangeRatesInitialState } from '../../exchangeRates/reducer'
import * as actions from '../actions'
import types from '../types'

jest.mock('blockstack', () => {
  return require('../../../../mocks/BlockstackMock')
})

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
      const isUserSignedInSpy = jest.spyOn(blockstack, 'isUserSignedIn').mockImplementation(() => true)
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
        expect(isUserSignedInSpy).toHaveBeenCalled()
        done()
      })
    })

    it('logged out user should not call anything', () => {
      const isUserSignedInSpy = jest.spyOn(blockstack, 'isUserSignedIn').mockImplementation(() => false)
      const getState = () => ({ user: { isLoading: false } })

      actions.loadUserData()(dispatch, getState)
      expect(dispatch).not.toHaveBeenCalledWith({ type: types.DATA_IS_LOADING, payload: false })
      expect(isUserSignedInSpy).toHaveBeenCalled()
    })

    it('should not call anything if data is already loading', () => {
      const isUserSignedInSpy = jest.spyOn(blockstack, 'isUserSignedIn').mockImplementation(() => true)
      const getState = () => ({ user: { isLoading: true } })

      actions.loadUserData()(dispatch, getState)
      expect(dispatch).not.toHaveBeenCalledWith({ type: types.DATA_IS_LOADING, payload: false })
      expect(isUserSignedInSpy).not.toHaveBeenCalled()
    })
  })

  describe('loginAs', () => {
    it('should login as blockstack', () => {
      const redirectToSignInSpy = jest.spyOn(blockstack, 'redirectToSignIn')
      actions.loginAs('blockstack')
      expect(redirectToSignInSpy).toHaveBeenCalled()
    })

    it('should login as guest', () => {
      const redirectToSignInSpy = jest.spyOn(blockstack, 'redirectToSignIn')

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
      expect(redirectToSignInSpy).not.toHaveBeenCalled()
    })
  })

  it('resetState should delete all data', async () => {
    const mockStore = configureMockStore([thunk])
    const store = mockStore({})

    actions.resetState(store.dispatch)
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
      }
    ])
  })

  it('userLogout should sign the user out', async () => {
    const signUserOutSpy = jest.spyOn(blockstack, 'signUserOut')

    await actions.userLogout()(dispatch)
    expect(signUserOutSpy).toHaveBeenCalled()
    expect(dispatch).toBeCalledTimes(5)
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
      jest.spyOn(blockstack, 'handlePendingSignIn').mockImplementation(() => Promise.resolve())
      jest.spyOn(blockstack, 'isUserSignedIn').mockImplementation(() => true)
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
            { type: 'HIDE_OVERLAY' }
          ])
          done()
        })
    })

    it('fails to sign in', (done) => {
      const handlePendingSignInSpy = jest.spyOn(blockstack, 'handlePendingSignIn')
      const mockStore = configureMockStore([thunk])
      const store = mockStore({ initialState })

      handlePendingSignInSpy.mockReturnValue(Promise.reject(new Error('Error message')))
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
