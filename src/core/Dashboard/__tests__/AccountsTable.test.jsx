import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import configureMockStore from 'redux-mock-store'
import AccountsTable from '../AccountsTable'
import { initialState as settingsInitialState } from '../../../store/settings/reducer'
import {
  assetAccounts,
  liabilityAccounts,
  groupByInstitution,
  initialState as accountsInitialState
} from '../../../store/accounts/reducer'

jest.mock('../../../common/InstitutionIcon/importLogos', () => [])
function renderContent(store, props) {
  const history = createMemoryHistory()
  return {
    ...render(
      <Provider store={store}>
        <Router history={history}>
          <AccountsTable {...props} />
        </Router>
      </Provider>
    ),
    props,
    history
  }
}

describe('AccountsTable', () => {
  it('renders correctly with no data', async () => {
    const mockStore = configureMockStore()
    const store = mockStore({
      settings: settingsInitialState,
      accounts: accountsInitialState
    })
    const { getByText, queryByText } = renderContent(store, { filter: 'Assets', data: [] })
    expect(getByText('Assets')).toBeInTheDocument()
    expect(queryByText('Liabilities')).not.toBeInTheDocument()
  })

  it('renders Assets correctly with a asset accounts', async () => {
    const byId = Object.keys(assetAccounts).reduce((result, accountType, index) => ({
      ...result,
      [index]: {
        id: index,
        accountType,
        groupId: 0,
        name: `${accountType} account`,
        institution: accountType === 'cash' ? 'Cach' : 'TD',
        currency: 'CAD',
        currentBalance: {
          accountCurrency: (index + 1) * 1000,
          localCurrency: (index + 1) * 1000
        }
      }
    }), {})
    const mockStore = configureMockStore()
    const store = mockStore({
      settings: settingsInitialState,
      accounts: {
        ...accountsInitialState,
        byId,
        byInstitution: groupByInstitution({ byId, byInstitution: {} })
      }
    })
    const { getByText, queryByText } = renderContent(store, { filter: 'Assets' })
    expect(getByText('Assets')).toBeInTheDocument()
    expect(queryByText('Liabilities')).not.toBeInTheDocument()
    Object.keys(assetAccounts).forEach((accountType) => {
      expect(getByText(`${accountType} account`)).toBeInTheDocument()
    })
  })

  it('renders Assets correctly with a liability accounts', async () => {
    const byId = Object.keys(liabilityAccounts).reduce((result, accountType, index) => ({
      ...result,
      [index]: {
        id: index,
        accountType,
        groupId: 0,
        name: `${accountType} account`,
        institution: 'TD',
        currency: 'CAD',
        currentBalance: {
          accountCurrency: (index + 1) * -1000,
          localCurrency: (index + 1) * -1000
        }
      }
    }), {})
    const mockStore = configureMockStore()
    const store = mockStore({
      settings: settingsInitialState,
      accounts: {
        ...accountsInitialState,
        byId,
        byInstitution: groupByInstitution({ byId, byInstitution: {} })
      }
    })
    const { getByText, queryByText, history } = renderContent(store, { filter: 'Liabilities' })
    const historyPushSpy = jest.spyOn(history, 'push')

    expect(getByText('Liabilities')).toBeInTheDocument()
    expect(queryByText('Assets')).not.toBeInTheDocument()
    Object.keys(liabilityAccounts).forEach((accountType) => {
      expect(getByText(`${accountType} account`)).toBeInTheDocument()
    })

    const firstAccount = Object.values(byId)[0]
    fireEvent.click(getByText(firstAccount.name))
    expect(historyPushSpy).toHaveBeenCalledWith(`/accounts/${firstAccount.id}/transactions`)
  })
})
