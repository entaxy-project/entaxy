import { UserSession, Person } from 'blockstack'
import { initialState as userInitialState } from '../user/reducer'
import { initialState as settingsInitialState } from '../settings/reducer'
import { initialState as accountsInitialState } from '../accounts/reducer'
import { initialState as transactionsInitialState } from '../transactions/reducer'
import { initialState as exchangeRatesInitialState } from '../exchangeRates/reducer'
import { initialState as budgetInitialState } from '../budget/reducer'
import {
  store,
  persistor,
  loginAs,
  userLogout
} from '..'
import { blockstackUserSession, blockstackPerson } from '../../../mocks/BlockstackMock'

jest.mock('blockstack')
UserSession.mockImplementation(() => blockstackUserSession)
Person.mockImplementation(() => blockstackPerson)

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

describe('store', () => {
  it('gets created with no persistor', () => {
    expect(store.getState()).toEqual({
      user: userInitialState,
      settings: settingsInitialState,
      accounts: accountsInitialState,
      transactions: transactionsInitialState,
      exchangeRates: exchangeRatesInitialState,
      budget: budgetInitialState
    })
    expect(persistor).toBeNull()
  })
  describe('loginAs', () => {
    it('loginAs blockstack and logout', () => {
      blockstackUserSession.isUserSignedIn.mockReturnValue(true)
      blockstackUserSession.signUserOut.mockReturnValue(true)
      expect(persistor).toBeNull()
      loginAs('blockstack')
      expect(persistor).not.toBeNull()
      expect(store.getState().user.isAuthenticatedWith).toEqual('blockstack')
      expect(store.getState().user.overlayMessage).toEqual('Loading data from Blockstack ...')
      userLogout()
      expect(store.getState().user).toEqual(userInitialState)
      expect(persistor).toBeNull()
    })

    it('loginAs blockstack and redirect to blockstack', () => {
      blockstackUserSession.isUserSignedIn.mockReturnValue(false)
      blockstackUserSession.isSignInPending.mockReturnValue(false)
      expect(persistor).toBeNull()
      loginAs('blockstack')
      expect(persistor).toBeNull()
      expect(store.getState().user.isAuthenticatedWith).toEqual(null)
      expect(blockstackUserSession.redirectToSignIn).toHaveBeenCalledWith(`${window.location.origin}/handle-login`)
    })

    it('loginAs guest and logout', () => {
      blockstackUserSession.isUserSignedIn.mockReturnValue(true)
      blockstackUserSession.signUserOut.mockReturnValue(true)
      expect(persistor).toBeNull()
      loginAs('guest')
      expect(persistor).not.toBeNull()
      expect(store.getState().user.isAuthenticatedWith).toEqual('guest')
      expect(store.getState().user.overlayMessage).toEqual('Loading data from local storage ...')
      userLogout()
      expect(store.getState().user).toEqual(userInitialState)
      expect(persistor).toBeNull()
    })
  })
})
