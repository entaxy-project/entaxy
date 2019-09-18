import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import LoginButton from '..'

describe('LoginButton', () => {
  it('renders nothing if user is not logged in', () => {
    const user = {
      isAuthenticatedWith: null
    }
    const mockStore = configureMockStore()
    const store = mockStore({ user })
    const { container } = render(
      <Provider store={store}>
        <LoginButton />
      </Provider>
    )
    expect(container).toBeEmpty()
  })

  it('renders user logged in with blockstack', () => {
    const user = {
      isAuthenticatedWith: 'blockstack',
      name: 'test user',
      username: 'testuser',
      pictureUrl: 'http://someimage/'
    }
    const mockStore = configureMockStore()
    const store = mockStore({ user })
    const { getByText } = render(
      <Provider store={store}>
        <LoginButton />
      </Provider>
    )
    expect(getByText(user.name)).toBeInTheDocument()
    expect(getByText((_, elem) => elem.src === user.pictureUrl)).toBeInTheDocument()
  })

  it('renders user logged in as guest', () => {
    const user = {
      isAuthenticatedWith: 'guest',
      name: 'test user',
      username: 'testuser',
      pictureUrl: 'http://someimage/'
    }
    const mockStore = configureMockStore()
    const store = mockStore({ user })
    const { getByText, queryByText } = render(
      <Provider store={store}>
        <LoginButton />
      </Provider>
    )
    expect(getByText(user.name)).toBeInTheDocument()
    expect(queryByText((_, elem) => elem.src === user.pictureUrl)).not.toBeInTheDocument()
  })
})
