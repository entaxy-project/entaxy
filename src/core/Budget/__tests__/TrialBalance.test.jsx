import React from 'react'
import {
  render,
  cleanup
} from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'
import TrialBalance from '../TrialBalance'
import { initialState as budgetInitialState } from '../../../store/budget/reducer'
import { initialState as accountsInitialState } from '../../../store/accounts/reducer'
import { initialState as transactionsInitialState } from '../../../store/transactions/reducer'
import { initialState as settingsInitialState } from '../../../store/settings/reducer'

afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})

const mockStore = configureMockStore([thunk])

describe('TrialBalance', () => {
  it('no accounts', async () => {
    const store = mockStore({
      settings: settingsInitialState,
      budget: budgetInitialState,
      accounts: accountsInitialState,
      transactions: transactionsInitialState
    })
    const { getByText } = render(
      <Provider store={store}>
        <TrialBalance />
      </Provider>
    )

    expect(getByText('Trial Balance')).toBeInTheDocument()
  })
})
