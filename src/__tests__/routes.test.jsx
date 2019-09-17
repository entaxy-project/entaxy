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
import {
  store,
  persistor,
  loginAs
} from '../store'
import Routes from '../routes'
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
      const { history, getByText, queryByText } = renderWithRouter((
        <Provider store={store}>
          <Routes />
        </Provider>
      ))
      expect(getByText('Insight into your finances, without sacrificing your data')).toBeInTheDocument()
      expect(history.entries.map((e) => e.pathname)).toEqual(['/'])
      expect(queryByText((_, element) => element.tagName.toLowerCase() === 'header')).not.toBeInTheDocument()
    })

    it('renders handleBlockstackLogin component', async () => {
      blockstackUserSession.isSignInPending.mockReturnValue(true)
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
      const { getByText, queryByText, getByTestId } = renderWithRouter((
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
      expect(getByText('You don\'t have any accounts yet.')).toBeInTheDocument()
      expect(getByText((_, element) => element.tagName.toLowerCase() === 'header')).toBeInTheDocument()
      expect(persistor).not.toBeNull()

      // Logout
      fireEvent.click(getByTestId('userNavButton'))
      fireEvent.click(getByTestId('logoutButton'))
      await waitForElement(() => getByText('Insight into your finances, without sacrificing your data'))
      expect(queryByText((_, element) => element.tagName.toLowerCase() === 'header')).not.toBeInTheDocument()
      expect(persistor).toBeNull()
    })

    it('logs in as blockstack and logs out', async () => {
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
      expect(getByText('You don\'t have any accounts yet.')).toBeInTheDocument()
      expect(persistor).not.toBeNull()

      // Logout
      blockstackUserSession.isUserSignedIn.mockReturnValue(false)
      fireEvent.click(getByTestId('userNavButton'))
      fireEvent.click(getByTestId('logoutButton'))
      await waitForElement(() => getByText('Insight into your finances, without sacrificing your data'))
      expect(persistor).toBeNull()
    })

    it('it renders new account', async () => {
      loginAs('guest')
      const { getByText, getByTestId } = renderWithRouter((
        <Provider store={store}>
          <Routes />
        </Provider>
      ), { route: '/accounts/new' })
      expect(getByText('Loading data from local storage ...')).toBeInTheDocument()
      await waitForElement(() => getByText('New account'))
      expect(getByText('New account')).toBeInTheDocument()
      expect(getByText((_, element) => element.tagName.toLowerCase() === 'header')).toBeInTheDocument()
      // Logout
      fireEvent.click(getByTestId('userNavButton'))
      fireEvent.click(getByTestId('logoutButton'))
    })

    it('it redirects to dashboard if editing non existing account', async () => {
      loginAs('guest')
      const { getByText, getByTestId } = renderWithRouter((
        <Provider store={store}>
          <Routes />
        </Provider>
      ), { route: '/accounts/bogus/edit' })
      expect(getByText('Loading data from local storage ...')).toBeInTheDocument()
      await waitForElement(() => getByText('Add an account'))
      expect(getByText('You don\'t have any accounts yet.')).toBeInTheDocument()
      // Logout
      fireEvent.click(getByTestId('userNavButton'))
      fireEvent.click(getByTestId('logoutButton'))
    })
  })
})
