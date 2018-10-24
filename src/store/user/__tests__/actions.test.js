import * as blockstack from 'blockstack'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as storage from '../../blockstackStorage'
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
  const dispatch = jest.fn()
  let loadStorageSpy

  beforeAll(() => {
    loadStorageSpy = jest.spyOn(storage, 'loadState').mockImplementation(() => Promise.resolve({}))
  })

  afterAll(() => {
    loadStorageSpy.mockRestore()
  })

  afterEach(() => {
    dispatch.mockClear()
  })

  describe('loadUserData', () => {
    it('signed in user should load the profile', () => {
      const isUserSignedInSpy = jest.spyOn(blockstack, 'isUserSignedIn')

      actions.loadUserData()(dispatch)

      expect(dispatch).toBeCalledWith({
        type: types.LOAD_USER_DATA_SUCCESS,
        payload: {
          isAuthenticated: true,
          name: 'mocked name',
          pictureUrl: 'mocked url',
          username: 'mocked username'
        }
      })
      expect(isUserSignedInSpy).toHaveBeenCalled()
    })

    it('logged out user should not set anything', () => {
      const isUserSignedInSpy = jest.spyOn(blockstack, 'isUserSignedIn')
      isUserSignedInSpy.mockReturnValueOnce(false)

      actions.loadUserData()(dispatch)

      expect(dispatch).not.toHaveBeenCalledWith({ type: types.LOAD_USER_DATA, payload: true })
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
    expect(actions.userLogout()).toEqual({ type: types.USER_LOGOUT })
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
    const error = new Error('Failed')
    jest.spyOn(storage, 'loadState').mockImplementationOnce(() => Promise.reject(error))

    actions.loadUserData()(dispatch).catch((e) => {
      expect(e).toEqual(error)
      done()
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
            {
              type: 'USER_LOGIN_ERROR',
              payload: new Error('Error message')
            }
          ])
        })
    })
  })
})
