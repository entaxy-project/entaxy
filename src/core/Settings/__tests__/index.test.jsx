/* eslint-disable react/display-name */
import React from 'react'
import { render, fireEvent, wait } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { initialState as settingsInitialState } from '../../../store/settings/reducer'
import Settings from '..'
import locales from '../../../data/locales'

function renderWithRouter(store) {
  const history = createMemoryHistory()
  const historyPushSpy = jest.spyOn(history, 'push')
  return {
    ...render(
      <Provider store={store}>
        <Router history={history}>
          <Settings history={history} />
        </Router>
      </Provider>
    ),
    history,
    historyPushSpy
  }
}

describe('Settings', () => {
  it('renders correctly', async () => {
    const mockStore = configureMockStore()
    const store = mockStore({ settings: settingsInitialState })
    const { getByText } = renderWithRouter(store)
    expect(getByText('Settings')).toBeInTheDocument()
    fireEvent.click(getByText(locales[store.getState().settings.locale]))
  })

  it('closes the form', async () => {
    const mockStore = configureMockStore([thunk])
    const store = mockStore({ settings: settingsInitialState })
    const { historyPushSpy, getByText } = renderWithRouter(store)
    fireEvent.click(getByText((_, elem) => elem.type === 'button' && elem.getAttribute('aria-label') === 'Close'))
    await wait(() => expect(historyPushSpy).toHaveBeenCalledWith('/dashboard'))
    expect(store.getActions()).toEqual([])
  })

  it('saves the form', async () => {
    const mockStore = configureMockStore([thunk])
    const store = mockStore({ settings: settingsInitialState })
    const { historyPushSpy, getByText } = renderWithRouter(store)
    fireEvent.click(getByText((_, elem) => elem.type === 'submit'))
    await wait(() => expect(historyPushSpy).toHaveBeenCalledWith('/dashboard'))
    expect(store.getActions()).toEqual([
      {
        type: 'UPDATE_SETTINGS',
        payload: settingsInitialState
      }, {
        type: 'SHOW_SNACKBAR',
        payload: {
          status: 'success',
          text: 'Your settings have been saved'
        }
      }
    ])
  })

  it('resets the user data', async () => {
    const mockStore = configureMockStore([thunk])
    const store = mockStore({ settings: settingsInitialState })
    const { historyPushSpy, getByText } = renderWithRouter(store)
    fireEvent.click(getByText('Reset - delete all my data'))
    getByText('Delete all your data? This cannot be undone.')
    fireEvent.click(getByText('Ok'))
    await wait(() => expect(historyPushSpy).toHaveBeenCalledWith('/dashboard'))
    expect(store.getActions().map((action) => action.type)).toEqual([
      'LOAD_SETTINGS',
      'LOAD_ACCOUNTS',
      'LOAD_TRANSACTIONS',
      'LOAD_EXCHANGE_RATES',
      'LOAD_BUDGET',
      'SHOW_SNACKBAR'
    ])
  })
})
