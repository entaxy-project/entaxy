import React from 'react'
import { render, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { Provider } from 'react-redux'
import { FlagsProvider } from 'flagged'
import { BrowserRouter } from 'react-router-dom'
import Landing from '..'
import { store } from '../../../store'
import features from '../../../features'

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
      <FlagsProvider features={features}>
        <Provider store={store}>
          <BrowserRouter>
            <Landing {...props} />
          </BrowserRouter>
        </Provider>
      </FlagsProvider>
    )
    expect(getByText('Your Personal Finances Simple & Private')).toBeInTheDocument()
  })
})
