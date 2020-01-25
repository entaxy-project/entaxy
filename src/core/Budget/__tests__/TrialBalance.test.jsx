import React from 'react'
import {
  render,
  cleanup
} from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import configureMockStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import faker from 'faker'
import TrialBalance from '../TrialBalance'
import { initialState as budgetInitialState } from '../../../store/budget/reducer'
import { groupByInstitution, initialState as accountsInitialState } from '../../../store/accounts/reducer'
import { initialState as transactionsInitialState } from '../../../store/transactions/reducer'
import { initialState as settingsInitialState } from '../../../store/settings/reducer'

afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})

const account = {
  id: faker.random.uuid(),
  name: faker.finance.accountName(),
  institution: 'TD',
  openingBalance: faker.finance.amount(),
  openingBalanceDate: Date.now(),
  currentBalance: {
    accountCurrency: faker.finance.amount(),
    localCurrency: faker.finance.amount()
  },
  currency: settingsInitialState.currency
}

const mockStore = configureMockStore()

const renderContent = (storeData = {}) => {
  let accounts = accountsInitialState
  if ('accounts' in storeData) {
    const byId = storeData.accounts.reduce((res, acc) => (
      { ...res, [acc.id]: acc }
    ), {})
    accounts = { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) }
  }

  const store = mockStore({
    settings: settingsInitialState,
    budget: budgetInitialState,
    accounts,
    transactions: transactionsInitialState
  })
  return {
    ...render(
      <Provider store={store}>
        <TrialBalance />
      </Provider>
    ),
    store
  }
}

describe('TrialBalance', () => {
  it('render with no data', async () => {
    const { getByText } = renderContent()
    expect(getByText('Trial Balance')).toBeInTheDocument()
  })

  it('render with some data', async () => {
    const { getByText } = renderContent({ accounts: [account] })
    expect(getByText('Trial Balance')).toBeInTheDocument()
  })
})
