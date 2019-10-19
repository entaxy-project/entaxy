import React from 'react'
import { render, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import ThemeProvider from '../../../ThemeProvider'
import Transactions from '..'
import {
  groupByInstitution
} from '../../../../store/accounts/reducer'
import { initialState as transactionsInitialState } from '../../../../store/transactions/reducer'
import { initialState as budgetInitialState } from '../../../../store/budget/reducer'
import { initialState as settingsInitialState } from '../../../../store/settings/reducer'

jest.mock('../TransactionDialog', () => 'TransactionDialog')

const account = {
  name: 'Checking',
  institution: 'TD',
  currency: 'CAD',
  openingBalance: 0,
  openingBalanceDate: Date.parse('2019/01/01'),
  currentBalance: { localCurrency: 1 }
}

const byId = {
  a1: { ...account, id: 'a1', openingBalanceDate: Date.now() },
  a2: { ...account, id: 'a2', openingBalanceDate: Date.now() }
}

afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})

const renderContent = async () => {
  const mockStore = configureMockStore()
  const store = mockStore({
    accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
    transactions: {
      ...transactionsInitialState,
      // older transactions from a differnt account
      list: [{
        accountId: 'a2',
        amount: { accountCurrency: 1 },
        createdAt: new Date().getTime()
      }]
    },
    budget: budgetInitialState,
    settings: settingsInitialState
  })

  const props = {
    match: { params: { accountId: byId.a1.id } }
  }
  return {
    ...render(
      <Provider store={store}>
        <ThemeProvider>
          <BrowserRouter>
            <Transactions {...props} />
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    ),
    props
  }
}

describe('Transactions', () => {
  it('renders correctly', async () => {
    const { getByText } = await renderContent()

    expect(getByText(`${byId.a1.institution} - ${byId.a1.name}`)).toBeInTheDocument()
  })
})
