import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import configureMockStore from 'redux-mock-store'
import Dashboard from '..'
import { groupByInstitution, initialState as accountsInitialState } from '../../../store/accounts/reducer'
import { initialState as settingsInitialState } from '../../../store/settings/reducer'
import { initialState as budgetInitialState } from '../../../store/budget/reducer'
import { initialState as exchangeRatesInitialState } from '../../../store/exchangeRates/reducer'

jest.mock('../../../common/InstitutionIcon/importLogos', () => [])
jest.mock('uuid/v4', () => jest.fn(() => 'xyz'))

const mockStore = configureMockStore()

const renderContent = (store) => {
  const history = createMemoryHistory()

  return {
    ...render(
      <Provider store={store}>
        <Router history={history}>
          <Dashboard />
        </Router>
      </Provider>
    ),
    history
  }
}

const accounts = [{
  id: 1,
  description: 'Checking',
  institution: 'TD',
  currency: 'CAD',
  openingBalance: 10,
  currentBalance: { accountCurrency: 1000, localCurrency: 1000 },
  groupId: 0
}, {
  id: 2,
  description: 'Savings',
  institution: 'TD',
  currency: 'EUR',
  openingBalance: 10,
  currentBalance: { accountCurrency: 1000, localCurrency: 1500 },
  groupId: 0
}]

describe('Dashboard', () => {
  it('renders correctly with no accounts', () => {
    const store = mockStore({
      settings: settingsInitialState,
      accounts: accountsInitialState,
      budget: budgetInitialState
    })
    const { getByText, queryByText } = renderContent(store)
    expect(queryByText('Assets')).not.toBeInTheDocument()
    expect(queryByText('Liabilities')).not.toBeInTheDocument()
    expect(getByText('You don\'t have any accounts yet.')).toBeInTheDocument()
  })

  it('renders correctly with one account', () => {
    const state = {
      settings: { ...settingsInitialState, locale: 'en-UK', currency: 'EUR' },
      accounts: {
        ...accountsInitialState,
        byId: { [accounts[0].id]: accounts[0] }
      },
      budget: budgetInitialState,
      exchangeRates: exchangeRatesInitialState
    }
    const store = mockStore({
      ...state,
      accounts: { ...state.accounts, byInstitution: groupByInstitution(state.accounts) }
    })
    const { getByText, queryByText } = renderContent(store)
    expect(getByText('Assets')).toBeInTheDocument()
    expect(getByText('Liabilities')).toBeInTheDocument()
    expect(queryByText('You don\'t have any accounts yet.')).not.toBeInTheDocument()
  })

  it('renders correctly with two accounts in a different currency', async () => {
    const state = {
      settings: { ...settingsInitialState, locale: 'en-UK', currency: 'EUR' },
      accounts: {
        ...accountsInitialState,
        byId: { [accounts[0].id]: accounts[0], [accounts[1].id]: accounts[1] }
      },
      budget: budgetInitialState,
      exchangeRates: exchangeRatesInitialState
    }
    const byInstitution = groupByInstitution(state.accounts)
    const store = mockStore({ ...state, accounts: { ...state.accounts, byInstitution } })
    const { getByText, queryByText } = renderContent(store)
    expect(getByText('Assets')).toBeInTheDocument()
    expect(getByText('Liabilities')).toBeInTheDocument()
    expect(queryByText('You don\'t have any accounts yet.')).not.toBeInTheDocument()
  })
})
