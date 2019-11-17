import React from 'react'
import { render, fireEvent, waitForElement } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import configureMockStore from 'redux-mock-store'
import Header from '..'
import { initialState as userInitialState } from '../../../store/user/reducer'

// https://github.com/mui-org/material-ui/issues/15726
global.document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document
  }
})

const renderContent = () => {
  const mockStore = configureMockStore()
  const store = mockStore({ user: userInitialState })
  const history = createMemoryHistory()

  const props = {
    match: { path: '/dashboard' }
  }
  return {
    ...render(
      <Provider store={store}>
        <Router history={history}>
          <Header {...props}>
            <div>content</div>
          </Header>
        </Router>
      </Provider>
    ),
    props,
    history
  }
}


describe('Header', () => {
  it('renders correctly', () => {
    const { getByText } = renderContent()

    expect(getByText('Dashboard')).toBeInTheDocument()
    expect(getByText('Budget')).toBeInTheDocument()
  })

  it('opens and closes menu', async () => {
    const { getByText, queryByText, history } = renderContent()
    const historyPushSpy = jest.spyOn(history, 'push')

    expect(queryByText('Money Flow')).not.toBeInTheDocument()
    expect(queryByText('History')).not.toBeInTheDocument()
    expect(queryByText('Categories')).not.toBeInTheDocument()
    // open the budget menu
    fireEvent.click(getByText('Budget'))
    waitForElement(() => getByText('Money Flow'))
    expect(getByText('History')).toBeInTheDocument()
    expect(getByText('Categories')).toBeInTheDocument()
    // close the menu
    fireEvent.click(getByText('Categories'))
    expect(historyPushSpy).toHaveBeenCalledWith('/budget-categories')
  })
})
