import * as blockstack from 'blockstack'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as storage from '../../blockstackStorage'
import { initialState } from '../reducer'
import * as actions from '../actions'
import types from '../types'

import { initialState as settingsInitialState } from '../../settings/reducer'
import { initialState as marketValuesInitialState } from '../../marketValues/reducer'
import { initialState as transactionsInitialState } from '../../transactions/reducer'

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

  describe('loadUserData', () => {
    it('signed in user should load the profile', (done) => {
      const isUserSignedInSpy = jest.spyOn(blockstack, 'isUserSignedIn').mockImplementation(() => true)

      actions.loadUserData()(dispatch).then(() => {
        expect(dispatch).toHaveBeenCalledWith({
          type: types.LOAD_USER_DATA_SUCCESS,
          payload: {
            isAuthenticated: true,
            name: 'mocked name',
            pictureUrl: 'mocked url',
            username: 'mocked username'
          }
        })
        expect(isUserSignedInSpy).toHaveBeenCalled()
        done()
      })
    })

    it('logged out user should not set anything', () => {
      const isUserSignedInSpy = jest.spyOn(blockstack, 'isUserSignedIn').mockImplementation(() => false)

      actions.loadUserData()(dispatch)

      expect(dispatch).not.toHaveBeenCalledWith({ type: types.LOAD_USER_DATA, payload: false })
      expect(isUserSignedInSpy).toHaveBeenCalled()
    })
  })

  it('userLogin should sign the user out', () => {
    const redirectToSignInSpy = jest.spyOn(blockstack, 'redirectToSignIn')
    expect(actions.userLogin()).toEqual({ type: types.USER_LOGIN })
    expect(redirectToSignInSpy).toHaveBeenCalled()
  })

  it('userLogout should sign the user out', () => {
    const signUserOutSpy = jest.spyOn(blockstack, 'signUserOut')

    actions.userLogout()(dispatch)

    expect(dispatch).toBeCalledWith({ type: types.USER_LOGOUT })
    expect(dispatch).toBeCalledWith({ type: 'LOAD_SETTINGS', payload: settingsInitialState })
    expect(dispatch).toBeCalledWith({ type: 'LOAD_MARKET_VALUES', payload: marketValuesInitialState })
    expect(dispatch).toBeCalledWith({ type: 'LOAD_TRANSACTIONS', payload: transactionsInitialState })

    expect(signUserOutSpy).toHaveBeenCalled()
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

  it('throws and error on failure to load blockstack storage', (done) => {
    const error = new Error('message')
    jest.spyOn(blockstack, 'isUserSignedIn').mockImplementation(() => true)
    jest.spyOn(storage, 'loadState').mockImplementation(() => Promise.reject(error))

    return actions.loadUserData()(dispatch).catch((e) => {
      expect(e).toEqual(error)
      done()
    })
  })

  describe('handleBlockstackLogin', () => {
    it('signs the user in', (done) => {
      jest.spyOn(storage, 'loadState').mockImplementation(() => Promise.resolve({}))
      jest.spyOn(blockstack, 'handlePendingSignIn').mockImplementation(() => Promise.resolve())
      jest.spyOn(blockstack, 'isUserSignedIn').mockImplementation(() => true)
      const mockStore = configureMockStore([thunk])
      const store = mockStore({ initialState })

      store.dispatch(actions.handleBlockstackLogin())
        .then(() => {
          expect(store.getActions()).toEqual([
            { type: 'LOAD_USER_DATA', payload: true },
            {
              type: 'LOAD_USER_DATA_SUCCESS',
              payload: {
                isAuthenticated: true,
                username: 'mocked username',
                name: 'mocked name',
                pictureUrl: 'mocked url'
              }
            },
            { type: 'LOAD_SETTINGS', payload: undefined },
            { type: 'LOAD_TRANSACTIONS', payload: undefined },
            { type: 'LOAD_MARKET_VALUES', payload: undefined },
            { type: 'LOAD_USER_DATA', payload: false }
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
