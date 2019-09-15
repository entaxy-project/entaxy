import React from 'react'
import { render, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import configureMockStore from 'redux-mock-store'

import { Provider } from 'react-redux'
import LoadingOverlay from '..'

afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})

it('renders message correctly', async () => {
  const mockStore = configureMockStore()
  const store = mockStore({ user: { overlayMessage: 'test' } })
  const { getByText } = render(
    <Provider store={store}>
      <LoadingOverlay />
    </Provider>
  )

  expect(getByText('test')).toBeInTheDocument()
})

it('renders nothing with nom message', async () => {
  const mockStore = configureMockStore()
  const store = mockStore({ user: { overlayMessage: null } })
  const { queryByText } = render(
    <Provider store={store}>
      <LoadingOverlay />
    </Provider>
  )

  expect(queryByText('test')).not.toBeInTheDocument()
})
