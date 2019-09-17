import React from 'react'
import {
  render,
  cleanup,
  fireEvent,
  waitForElement,
  wait
} from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { Provider } from 'react-redux'
import { UserSession, Person } from 'blockstack'
import { store, persistor, loginAs } from '../store'
import Routes from '../routes'
// import Header from '../common/Header'
import { blockstackUserSession, blockstackPerson } from '../../mocks/BlockstackMock'

jest.mock('blockstack')
UserSession.mockImplementation(() => blockstackUserSession)
Person.mockImplementation(() => blockstackPerson)

jest.mock('../common/InstitutionIcon', () => 'InstitutionIcon')

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

afterEach(() => {
  cleanup()
})

// https://github.com/mui-org/material-ui/issues/15726
global.document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document
  }
})

function renderWithRouter(
  children,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] })
  } = {}
) {
  const historyPushSpy = jest.spyOn(history, 'push')
  return {
    ...render(<Router history={history}>{children}</Router>),
    history,
    historyPushSpy
  }
}

describe('Routes', () => {
  describe('Logged out routes', () => {
    it('renders home page if not logged in', () => {
      blockstackUserSession.isSignInPending.mockReturnValue(false)
      blockstackUserSession.isUserSignedIn.mockReturnValue(false)
      const { history, getByText } = renderWithRouter((
        <Provider store={store}>
          <Routes />
        </Provider>
      ))
      expect(getByText('Insight into your finances, without sacrificing your data')).toBeInTheDocument()
      expect(history.entries.map((e) => e.pathname)).toEqual(['/'])
    })

    it('renders handleBlockstackLogin component', async () => {
      blockstackUserSession.handlePendingSignIn.mockImplementation(() => Promise.resolve())
      blockstackUserSession.isSignInPending.mockReturnValue(true)
      blockstackUserSession.isUserSignedIn.mockReturnValue(false)
      const { getByText, history, historyPushSpy } = renderWithRouter((
        <Provider store={store}>
          <Routes />
        </Provider>
      ), { route: '/handle-login' })
      expect(blockstackUserSession.handlePendingSignIn).toHaveBeenCalled()
      await wait(() => expect(historyPushSpy).toHaveBeenCalled())
      expect(getByText('Insight into your finances, without sacrificing your data')).toBeInTheDocument()
      expect(history.entries.map((e) => e.pathname)).toEqual(['/handle-login', '/'])
    })

    it('redirects to home page if not logged in', () => {
      blockstackUserSession.isSignInPending.mockReturnValue(false)
      blockstackUserSession.isUserSignedIn.mockReturnValue(false)
      const { history, getByText } = renderWithRouter((
        <Provider store={store}>
          <Routes />
        </Provider>
      ), { route: '/dashboard' })
      expect(getByText('Insight into your finances, without sacrificing your data')).toBeInTheDocument()
      expect(history.entries.map((e) => e.pathname)).toEqual(['/'])
    })
  })

  describe('Logged in routes', () => {
    it('logs in as guest and logs out', async () => {
      blockstackUserSession.isSignInPending.mockReturnValue(false)
      blockstackUserSession.isUserSignedIn.mockReturnValue(false)
      const { getByText, getByTestId } = renderWithRouter((
        <Provider store={store}>
          <Routes />
        </Provider>
      ))
      expect(getByText('Insight into your finances, without sacrificing your data')).toBeInTheDocument()
      expect(getByText('Sign in with Blockstack')).toBeInTheDocument()

      // Login with blockstack
      fireEvent.click(getByTestId('signinAsGuestButton'))
      expect(getByText('Loading data from local storage ...')).toBeInTheDocument()
      await waitForElement(() => getByText('Add an account'))
      expect(persistor).not.toBeNull()

      // Logout
      fireEvent.click(getByTestId('userNavButton'))
      fireEvent.click(getByTestId('logoutButton'))
      await waitForElement(() => getByText('Insight into your finances, without sacrificing your data'))
      expect(persistor).toBeNull()
    })

    it('logs in as blockstack and logs out', async () => {
      blockstackUserSession.isSignInPending.mockReturnValue(false)
      blockstackUserSession.isUserSignedIn.mockReturnValue(false)

      const { getByText, getByTestId } = renderWithRouter((
        <Provider store={store}>
          <Routes />
        </Provider>
      ))
      expect(getByText('Insight into your finances, without sacrificing your data')).toBeInTheDocument()
      expect(getByText('Sign in with Blockstack')).toBeInTheDocument()

      // Login with blockstack
      blockstackUserSession.isUserSignedIn.mockReturnValue(true)
      fireEvent.click(getByTestId('signinWithBlockstackButton'))
      await waitForElement(() => getByText('Loading data from Blockstack ...'))
      await waitForElement(() => getByText('Add an account'))
      expect(persistor).not.toBeNull()

      // Logout
      blockstackUserSession.isUserSignedIn.mockReturnValue(false)
      fireEvent.click(getByTestId('userNavButton'))
      fireEvent.click(getByTestId('logoutButton'))
      await waitForElement(() => getByText('Insight into your finances, without sacrificing your data'))
      expect(persistor).toBeNull()
    })

    it.skip('it renders new account', async () => {
      loginAs('guest')
      blockstackUserSession.isSignInPending.mockReturnValue(false)
      blockstackUserSession.isUserSignedIn.mockReturnValue(false)
      const { getByText } = renderWithRouter((
        <Provider store={store}>
          <Routes />
        </Provider>
      ), { route: '/dashboard' })
      await wait()
      getByText('Add an account')
    })
  })
})
