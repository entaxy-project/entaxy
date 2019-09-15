import React from 'react'
import { render, cleanup, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { UserSession, Person } from 'blockstack'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import LandingCard from '../LandingCard'
import { initialState as userInitialState } from '../../../store/user/reducer'

import { blockstackUserSession, blockstackPerson } from '../../../../mocks/BlockstackMock'

jest.mock('blockstack')
UserSession.mockImplementation(() => blockstackUserSession)
Person.mockImplementation(() => blockstackPerson)

afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})

const mockStore = configureMockStore([thunk])
const mockHistoryPush = jest.fn()


describe('LandingCard', () => {
  it('renders correctly for signed out user', async () => {
    const store = mockStore({ user: userInitialState })
    const props = {
      history: { push: mockHistoryPush }
    }
    const { getByText } = render(
      <Provider store={store}>
        <BrowserRouter>
          <LandingCard {...props} />
        </BrowserRouter>
      </Provider>
    )
    expect(getByText('Sign in with Blockstack')).toBeInTheDocument()
    expect(getByText('Don\'t sign in yet')).toBeInTheDocument()
  })

  it('handles login with blockstack', async () => {
    const store = mockStore({ user: userInitialState })
    const props = {
      history: { push: mockHistoryPush }
    }
    const { getByTestId } = render(
      <Provider store={store}>
        <BrowserRouter>
          <LandingCard {...props} />
        </BrowserRouter>
      </Provider>
    )
    fireEvent.click(getByTestId('signinWithBlockstackButton'))
  })

  it('handles login as guest', async () => {
    const store = mockStore({ user: userInitialState })
    const props = {
      history: { push: mockHistoryPush }
    }
    const { getByTestId } = render(
      <Provider store={store}>
        <BrowserRouter>
          <LandingCard {...props} />
        </BrowserRouter>
      </Provider>
    )
    fireEvent.click(getByTestId('signinAsGuestButton'))
  })

  it('renders correctly for user signed in', async () => {
    const store = mockStore({
      user: {
        ...userInitialState,
        isAuthenticatedWith: 'blockstack',
        name: 'Tester'
      }
    })
    const props = {
      history: { push: mockHistoryPush }
    }
    const { getByText } = render(
      <Provider store={store}>
        <BrowserRouter>
          <LandingCard {...props} />
        </BrowserRouter>
      </Provider>
    )
    expect(getByText('Tester')).toBeInTheDocument()
  })
})
