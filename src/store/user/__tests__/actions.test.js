import * as blockstack from 'blockstack'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { initialState } from '../reducer'
import * as actions from '../actions'
import types from '../types'

jest.mock('blockstack', () => {
  return require('../../../../mocks/BlockstackServiceMock')
})

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

describe('user actions', () => {
  describe('fetchUserData', () => {
    it('signed in user should load the profile', () => {
      const isUserSignedInSpy = jest.spyOn(blockstack, 'isUserSignedIn')
      isUserSignedInSpy.mockReturnValue(true)

      expect(actions.fetchUserData()).toEqual({
        type: types.FETCH_USER_DATA,
        payload: {
          isAuthenticated: true,
          name: 'mocked name',
          pictureUrl: 'mocked url',
          username: 'mocked username'
        }
      })
      expect(isUserSignedInSpy).toHaveBeenCalled()
    })

    it('pending user should set isLoginPending', () => {
      const isUserSignedInSpy = jest.spyOn(blockstack, 'isUserSignedIn')
      const isSignInPendingSpy = jest.spyOn(blockstack, 'isSignInPending')
      isUserSignedInSpy.mockReturnValue(false)
      isSignInPendingSpy.mockReturnValue(true)

      expect(actions.fetchUserData()).toEqual({
        type: types.FETCH_USER_DATA,
        payload: {
          isLoginPending: true
        }
      })
      expect(isUserSignedInSpy).toHaveBeenCalled()
      expect(isSignInPendingSpy).toHaveBeenCalled()
    })

    it('logged out user should not set anything', () => {
      const isUserSignedInSpy = jest.spyOn(blockstack, 'isUserSignedIn')
      const isSignInPendingSpy = jest.spyOn(blockstack, 'isSignInPending')
      isUserSignedInSpy.mockReturnValue(false)
      isSignInPendingSpy.mockReturnValue(false)

      expect(actions.fetchUserData()).toEqual({ type: types.FETCH_USER_DATA })
      expect(isUserSignedInSpy).toHaveBeenCalled()
      expect(isSignInPendingSpy).toHaveBeenCalled()
    })
  })

  it('userLogin should sign the user out', () => {
    const redirectToSignInSpy = jest.spyOn(blockstack, 'redirectToSignIn')
    expect(actions.userLogin()).toEqual({ type: types.USER_LOGIN })
    expect(redirectToSignInSpy).toHaveBeenCalled()
  })

  it('userLogout should sign the user out', () => {
    const signUserOutSpy = jest.spyOn(blockstack, 'signUserOut')
    expect(actions.userLogout()).toEqual({ type: types.USER_LOGOUT })
    expect(signUserOutSpy).toHaveBeenCalled()
  })

  it('userLoginError should sign the user out', () => {
    expect(actions.userLoginError({ message: 'Error' })).toEqual({
      type: types.USER_LOGIN_ERROR,
      payload: { message: 'Error' }
    })
  })

  describe('handleBlockstackLogin', () => {
    it('signs the user in', () => {
      const handlePendingSignInSpy = jest.spyOn(blockstack, 'handlePendingSignIn')
      const mockStore = configureMockStore([thunk])
      const store = mockStore({ initialState })

      handlePendingSignInSpy.mockReturnValue(Promise.resolve())
      return store.dispatch(actions.handleBlockstackLogin())
        .then(() => {
          expect(store.getActions()).toEqual([
            { type: 'USER_HANDLE_LOGIN' },
            { type: 'USER_LOGIN_SUCCESS' },
            { type: 'FETCH_USER_DATA' }
          ])
        })
    })

    it('handles signs fail', () => {
      const handlePendingSignInSpy = jest.spyOn(blockstack, 'handlePendingSignIn')
      const mockStore = configureMockStore([thunk])
      const store = mockStore({ initialState })

      handlePendingSignInSpy.mockReturnValue(Promise.reject(new Error('Error message')))
      return store.dispatch(actions.handleBlockstackLogin())
        .then(() => {
          expect(store.getActions()).toEqual([
            { type: 'USER_HANDLE_LOGIN' },
            {
              type: 'USER_LOGIN_ERROR',
              payload: new Error('Error message')
            }
          ])
        })
    })
  })
})
