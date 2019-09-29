import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import ThemeProvider from '../../../core/ThemeProvider'
import { initialState as userInitialState } from '../../../store/user/reducer'

import SnackbarMessage from '..'

describe('SnackbarMessage', () => {
  it('it doesn\'t render anything if there\'s no message', () => {
    const mockStore = configureMockStore()
    const store = mockStore({ user: userInitialState })
    const { queryByTestId } = render(
      <Provider store={store}>
        <ThemeProvider>
          <SnackbarMessage />
        </ThemeProvider>
      </Provider>
    )
    expect(queryByTestId('snackback')).not.toBeInTheDocument()
  })

  it('it renders a success message correctly', () => {
    const mockStore = configureMockStore()
    const store = mockStore({ user: { snackbarMessage: { text: 'message', status: 'success' } } })
    const { getByText, queryByText, getByTestId } = render(
      <Provider store={store}>
        <ThemeProvider>
          <SnackbarMessage />
        </ThemeProvider>
      </Provider>
    )
    expect(getByTestId('snackback')).toBeInTheDocument()
    expect(getByText('message')).toBeInTheDocument()
    expect(getByTestId('successIcon')).toBeInTheDocument()
    expect(queryByText('errorIcon')).not.toBeInTheDocument()
    // The snackbar should disapear in 4 secs so we click the body to make it isaoear sooner
    fireEvent.click(getByText((_, element) => element.tagName === 'BODY'))
    expect(store.getActions()).toEqual([{ type: 'HIDE_SNACKBAR' }])
  })

  it('it renders a error message correctly', () => {
    const mockStore = configureMockStore()
    const store = mockStore({ user: { snackbarMessage: { text: 'message', status: 'error' } } })
    const { getByText, queryByText, getByTestId } = render(
      <Provider store={store}>
        <ThemeProvider>
          <SnackbarMessage />
        </ThemeProvider>
      </Provider>
    )
    expect(getByTestId('snackback')).toBeInTheDocument()
    expect(getByText('message')).toBeInTheDocument()
    expect(getByTestId('errorIcon')).toBeInTheDocument()
    expect(queryByText('successIcon')).not.toBeInTheDocument()
    // The snackbar should disapear in 4 secs so we click the body to make it isaoear sooner
    fireEvent.click(getByText((_, element) => element.tagName === 'BODY'))
    expect(store.getActions()).toEqual([{ type: 'HIDE_SNACKBAR' }])
  })
})
