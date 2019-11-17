import React from 'react'
import { render, fireEvent, waitForElement } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import configureMockStore from 'redux-mock-store'
import LoginButton from '..'

// https://github.com/mui-org/material-ui/issues/15726
global.document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document
  }
})

const mockStore = configureMockStore()

const renderContent = (store) => {
  const history = createMemoryHistory()

  return {
    ...render(
      <Provider store={store}>
        <Router history={history}>
          <LoginButton />
        </Router>
      </Provider>
    ),
    history
  }
}

describe('LoginButton', () => {
  it('renders nothing if user is not logged in', () => {
    const user = {
      isAuthenticatedWith: null
    }
    const store = mockStore({ user })
    const { container } = renderContent(store)
    expect(container).toBeEmpty()
  })

  it('renders user logged in with blockstack', () => {
    const user = {
      isAuthenticatedWith: 'blockstack',
      name: 'test user',
      username: 'testuser',
      pictureUrl: 'http://someimage/'
    }
    const store = mockStore({ user })
    const { getByText } = renderContent(store)
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
    const store = mockStore({ user })
    const { getByText, queryByText } = renderContent(store)
    expect(getByText(user.name)).toBeInTheDocument()
    expect(queryByText((_, elem) => elem.src === user.pictureUrl)).toBeInTheDocument()
  })

  it('opens and closes menu', async () => {
    const user = {
      isAuthenticatedWith: 'guest',
      name: 'test user',
      username: 'testuser',
      pictureUrl: 'http://someimage/'
    }
    const store = mockStore({ user })
    const { getByText, queryByText, history } = renderContent(store)
    const historyPushSpy = jest.spyOn(history, 'push')

    expect(queryByText(user.name)).toBeInTheDocument()
    expect(queryByText('Settings')).not.toBeInTheDocument()
    expect(queryByText('Close Session')).not.toBeInTheDocument()
    // open the budget menu
    fireEvent.click(getByText(user.name))
    waitForElement(() => getByText('Settings'))
    expect(getByText('Settings')).toBeInTheDocument()
    expect(getByText('Close session')).toBeInTheDocument()
    // close the menu
    fireEvent.click(getByText('Settings'))
    expect(historyPushSpy).toHaveBeenCalledWith('/settings')
  })
})
