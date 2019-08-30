import React from 'react'
import { render, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import Landing from '..'
import store from '../../../store'

afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})

describe('Landing page', () => {
  it('renders correctly', async () => {
    const props = {
      history: {}
    }
    const { getByText } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Landing {...props} />
        </BrowserRouter>
      </Provider>
    )
    expect(getByText('Insight into your finances, without sacrificing your data')).toBeInTheDocument()
  })
})
