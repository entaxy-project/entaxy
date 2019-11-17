import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { Provider } from 'react-redux'
import { format, startOfMonth, subMonths } from 'date-fns'
import configureMockStore from 'redux-mock-store'
import HistoryChart from '../HistoryChart'
import { groupByInstitution, initialState as accountsInitialState } from '../../../store/accounts/reducer'
import { initialState as transactionsInitialState } from '../../../store/transactions/reducer'
import { initialState as budgetInitialState } from '../../../store/budget/reducer'
import { initialState as settingsInitialState } from '../../../store/settings/reducer'

const account = {
  name: 'Checking',
  institution: 'TD',
  currency: 'CAD',
  openingBalance: 0,
  openingBalanceDate: Date.parse('2019/01/01'),
  currentBalance: { localCurrency: 1 }
}

const byId = {
  a1: { ...account, id: 'a1', openingBalanceDate: Date.now() }
}

const transactions = [{
  accountId: 'a1',
  amount: { accountCurrency: 1, localCurrency: 1 },
  createdAt: new Date().getTime()
}]

const group = budgetInitialState.categoryTree[0]
const category = group.options[0]

const transactionsWithCategories = [{
  accountId: 'a1',
  amount: { accountCurrency: 2, localCurrency: 2 },
  createdAt: new Date().getTime(),
  categoryId: category.id
}]

const renderContent = (store) => {
  return {
    ...render(
      <Provider store={store}>
        <HistoryChart />
      </Provider>
    )
  }
}

describe('HistoryChart', () => {
  const mockStore = configureMockStore()

  it('renders correctly with no data', () => {
    const store = mockStore({
      accounts: accountsInitialState,
      transactions: transactionsInitialState,
      budget: budgetInitialState,
      settings: settingsInitialState
    })
    const { getByText, getByTestId } = renderContent(store)

    const startDate = subMonths(startOfMonth(new Date()), 3)
    const endDate = new Date()

    expect(getByText('Budget history')).toBeInTheDocument()
    expect(getByTestId('DateRangeButton')).toBeInTheDocument()
    expect(getByText(`${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`)).toBeInTheDocument()
    expect(getByText('Not enough data to generate chart')).toBeInTheDocument()
  })

  it('renders correctly with one transaction but no categories', () => {
    const store = mockStore({
      accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
      transactions: { ...transactionsInitialState, list: transactions },
      budget: budgetInitialState,
      settings: settingsInitialState
    })
    const { getByText, queryByText, getByTestId } = renderContent(store)

    const startDate = subMonths(startOfMonth(new Date()), 3)
    const endDate = new Date()

    expect(getByText('Budget history')).toBeInTheDocument()
    expect(getByTestId('DateRangeButton')).toBeInTheDocument()
    expect(getByText(`${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`)).toBeInTheDocument()
    expect(queryByText('Not enough data to generate chart')).toBeInTheDocument()
  })

  it('renders correctly with one transaction', () => {
    const store = mockStore({
      accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
      transactions: { ...transactionsInitialState, list: transactionsWithCategories },
      budget: budgetInitialState,
      settings: settingsInitialState
    })
    const { getByText, queryByText, getByTestId } = renderContent(store)

    expect(getByText('Budget history')).toBeInTheDocument()
    expect(getByTestId('DateRangeButton')).toBeInTheDocument()
    const startDate = subMonths(startOfMonth(new Date()), 3)
    const endDate = new Date()
    expect(getByText(`${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`)).toBeInTheDocument()
    expect(queryByText('Not enough data to generate chart')).not.toBeInTheDocument()
  })
})
