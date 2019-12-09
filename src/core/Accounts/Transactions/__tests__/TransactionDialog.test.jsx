import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import configureMockStore from 'redux-mock-store'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import TransactionDialog from '../TransactionDialog'
import ThemeProvider from '../../../ThemeProvider'
import { initialState as settingsInitialState } from '../../../../store/settings/reducer'
import { groupByInstitution } from '../../../../store/accounts/reducer'
import { initialState as budgetInitialState } from '../../../../store/budget/reducer'

const account = {
  id: 1,
  name: 'Checking',
  institution: 'TD',
  openingBalance: 1000,
  openingBalanceDate: Date.now(),
  currentBalance: { accountCurrency: 1000, localCurrency: 1000 },
  currency: settingsInitialState.currency
}

const mockHandleCancel = jest.fn()
const mockHandleDelete = jest.fn()

const renderContent = (props) => {
  const mockStore = configureMockStore()
  const byId = { [account.id]: account }
  const store = mockStore({
    accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
    settings: settingsInitialState,
    budget: budgetInitialState
  })

  const newProps = {
    open: true,
    onCancel: mockHandleCancel,
    onDelete: mockHandleDelete,
    account,
    transaction: null,
    ...props
  }
  return {
    ...render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter initialEntries={[`/accounts/${account.id}/import/CSV`]} initialIndex={0}>
            <TransactionDialog {...newProps} />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    ),
    props
  }
}

describe('TransactionDialog', () => {
  it('renders correctly in new mode', async () => {
    const { getByText } = await renderContent()

    expect(getByText('New transaction')).toBeInTheDocument()
  })

  it('renders correctly in edit mode', async () => {
    const { getByText } = await renderContent({
      transaction: {
        id: 1,
        accountId: account.id,
        createdAt: new Date('2019-01-01').getTime(),
        amount: { accountCurrency: 1 }
      }
    })

    expect(getByText('Edit transaction')).toBeInTheDocument()
  })
})
