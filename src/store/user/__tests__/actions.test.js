import { UserSession, Person } from 'blockstack'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
// import * as storage from '../../storage'
import * as blockstackStorage from '../../blockstackStorage'
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

  it('should updateLoginData', () => {
    const payload = {
      isAuthenticatedWith: 'blockstack',
      username: 'mocked username',
      name: 'mocked name',
      pictureUrl: 'mocked url'
    }
    expect(actions.updateLoginData(payload)).toEqual({
      type: types.UPDATE_LOGIN_DATA,
      payload
    })
  })

  it('should set userLoginError', () => {
    expect(actions.userLoginError({ message: 'Error' })).toEqual({
      type: types.USER_LOGIN_ERROR,
      payload: { message: 'Error' }
    })
  })

  it('should showOverlayr', () => {
    expect(actions.showOverlay('Test message')).toEqual({
      type: types.SHOW_OVERLAY,
      payload: 'Test message'
    })
  })

  it('should showOverlayr', () => {
    expect(actions.hideOverlay()).toEqual({
      type: types.HIDE_OVERLAY
    })
  })

  describe.skip('old stuff', () => {
    it('first time signed in with Blockstack should start with initial state', async () => {
      // const loadStateSpy = jest.spyOn(storage, 'loadState')
      jest.spyOn(blockstackStorage, 'loadState').mockImplementation(() => Promise.resolve({
        settings: {},
        accounts: {},
        transactions: {},
        exchangeRates: {},
        budget: {}
      }))
      blockstackUserSession.isUserSignedIn.mockReturnValue(true)

      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        settings: settingsInitialState,
        user: {
          ...initialState,
          // This is needed because the mock store doesn't save anything
          isAuthenticatedWith: 'blockstack'
        }
      })
      await store.dispatch(actions.loadUserDataFromBlockstack())
      // expect(loadStateSpy).toHaveBeenCalled()
      expect(blockstackUserSession.isUserSignedIn).toHaveBeenCalled()

      expect(store.getActions()).toEqual([
        {
          type: 'UPDATE_LOGIN_DATA',
          payload: {
            isAuthenticatedWith: 'blockstack',
            username: 'mocked username',
            name: 'mocked name',
            pictureUrl: 'mocked url'
          }
        },
        { type: 'SHOW_OVERLAY', payload: 'Loading data from Blockstack...' },
        { type: 'LOAD_SETTINGS', payload: { overlayMessage: null, snackbarMessage: null } },
        { type: 'LOAD_ACCOUNTS', payload: {} },
        { type: 'LOAD_TRANSACTIONS', payload: {} },
        { type: 'LOAD_EXCHANGE_RATES', payload: {} },
        { type: 'LOAD_BUDGET', payload: {} },
        { type: 'HIDE_OVERLAY' }
      ])
    })

    it('second time signed in with Blockstack should start with loaded state', async () => {
      blockstackUserSession.isUserSignedIn.mockReturnValue(true)
      const loadedState = {
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState,
        accounts: accountsInitialState,
        transactions: transactionsInitialState,
        budget: budgetInitialState
      }
      jest.spyOn(blockstackStorage, 'loadState').mockImplementation(() => Promise.resolve(loadedState))

      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        user: {
          ...initialState,
          // This is needed because the mock store doesn't save anything
          isAuthenticatedWith: 'blockstack'
        },
        settings: { overlayMessage: 'message' }
      })
      await store.dispatch(actions.loadUserDataFromBlockstack())
      expect(store.getActions()).toEqual([
        {
          type: 'UPDATE_LOGIN_DATA',
          payload: {
            isAuthenticatedWith: 'blockstack',
            username: 'mocked username',
            name: 'mocked name',
            pictureUrl: 'mocked url'
          }
        },
        { type: 'SHOW_OVERLAY', payload: 'Loading data from Blockstack...' },
        { type: 'LOAD_SETTINGS', payload: { ...loadedState.settings, overlayMessage: 'message' } },
        { type: 'LOAD_ACCOUNTS', payload: loadedState.accounts },
        { type: 'LOAD_TRANSACTIONS', payload: loadedState.transactions },
        { type: 'LOAD_EXCHANGE_RATES', payload: loadedState.exchangeRates },
        { type: 'LOAD_BUDGET', payload: loadedState.budget },
        { type: 'HIDE_OVERLAY' }
      ])

      expect(blockstackUserSession.isUserSignedIn).toHaveBeenCalled()
    })
    it('logged out user should not call anything', () => {
      blockstackUserSession.isUserSignedIn.mockReturnValue(false)
      const getState = () => ({ user: { isLoading: false } })

      actions.loadUserDataFromBlockstack()(dispatch, getState)
      expect(dispatch).not.toHaveBeenCalledWith({ type: types.DATA_IS_LOADING, payload: false })
      expect(blockstackUserSession.isUserSignedIn).toHaveBeenCalled()
    })

    it('should not call anything if data is already loading', () => {
      blockstackUserSession.isUserSignedIn.mockReturnValue(true)
      const getState = () => ({ user: { isLoading: true } })

      actions.loadUserDataFromBlockstack()(dispatch, getState)
      expect(dispatch).not.toHaveBeenCalledWith({ type: types.DATA_IS_LOADING, payload: false })
      expect(blockstackUserSession.isUserSignedIn).not.toHaveBeenCalled()
    })
  })

  describe.skip('loginAs', () => {
    it('should login as blockstack', () => {
      actions.loginAs('blockstack')
      expect(blockstackUserSession.redirectToSignIn).toHaveBeenCalled()
    })

    it('should login as guest', () => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({})
      store.dispatch(actions.loginAs('guest'))
      expect(store.getActions()).toEqual([{
        type: types.UPDATE_LOGIN_DATA,
        payload: {
          isAuthenticatedWith: 'guest',
          name: 'Guest user',
          pictureUrl: null,
          username: 'guest'
        }
      }])
      expect(blockstackUserSession.redirectToSignIn).not.toHaveBeenCalled()
    })
  })

  describe.skip('logout', () => {
    it('userLogout should sign the user out', async () => {
      await actions.userLogout()(dispatch)
      expect(blockstackUserSession.signUserOut).toHaveBeenCalled()
      expect(dispatch).toBeCalledTimes(2)
      expect(dispatch).toBeCalledWith({ type: types.USER_LOGOUT })
    })
  })

  describe.skip('handleBlockstackLogin', () => {
    it('signs the user in', (done) => {
      jest.spyOn(blockstackStorage, 'loadState').mockImplementation(() => Promise.resolve({}))
      blockstackUserSession.handlePendingSignIn.mockReturnValue(Promise.resolve())
      blockstackUserSession.isUserSignedIn.mockReturnValue(true)

      const mockStore = configureMockStore([thunk])
      const store = mockStore({ user: { ...initialState, isAuthenticatedWith: 'blockstack' } })

      store.dispatch(actions.handleBlockstackLogin())
        .then(() => {
          expect(store.getActions()).toEqual([
            {
              type: 'UPDATE_LOGIN_DATA',
              payload: {
                isAuthenticatedWith: 'blockstack',
                username: 'mocked username',
                name: 'mocked name',
                pictureUrl: 'mocked url'
              }
            },
            { type: 'SHOW_OVERLAY', payload: 'Loading data from Blockstack...' },
            { type: 'LOAD_SETTINGS', payload: { snackbarMessage: null } },
            { type: 'LOAD_ACCOUNTS', payload: undefined },
            { type: 'LOAD_TRANSACTIONS', payload: undefined },
            { type: 'LOAD_EXCHANGE_RATES', payload: undefined },
            { type: 'LOAD_BUDGET', payload: undefined },
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
