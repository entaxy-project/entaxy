import React from 'react'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import TransactionDialog from '../TransactionDialog'
import ThemeProvider from '../../../ThemeProvider'
import { initialState as settingsInitialState } from '../../../../store/settings/reducer'
import { groupByInstitution } from '../../../../store/accounts/reducer'
import { initialState as budgetInitialState } from '../../../../store/budget/reducer'

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

const account = {
  id: 1,
  name: 'Checking',
  institution: 'TD',
  openingBalance: 1000,
  openingBalanceDate: Date.now(),
  currentBalance: { accountCurrency: 1000, localCurrency: 1000 },
  currency: settingsInitialState.currency
}

describe('ConfirmDialog', () => {
  const mockHandleCancel = jest.fn()
  const mockHandleDelete = jest.fn()

  it('matches snapshot', () => {
    const mockStore = configureMockStore()
    const byId = { [account.id]: account }
    const store = mockStore({
      accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
      settings: settingsInitialState,
      budget: budgetInitialState
    })
    const wrapper = mount((
      <BrowserRouter>
        <Provider store={store}>
          <ThemeProvider>
            <TransactionDialog
              open={true}
              onCancel={mockHandleCancel}
              onDelete={mockHandleDelete}
              account={{ id: 1 }}
              transaction={{ id: 1, createdAt: new Date('2019-01-01'), amount: { accountCurrency: 1 } }}
            />
          </ThemeProvider>
        </Provider>
      </BrowserRouter>
    ))
    expect(wrapper.debug()).toMatchSnapshot()
  })
})
