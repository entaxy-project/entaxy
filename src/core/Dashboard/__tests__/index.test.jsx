import React from 'react'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import Dashboard from '../index'
import { groupByInstitution, initialState as accountsInitialState } from '../../../store/accounts/reducer'
import { initialState as settingsInitialState } from '../../../store/settings/reducer'
import { initialState as budgetInitialState } from '../../../store/budget/reducer'
import { initialState as exchangeRatesInitialState } from '../../../store/exchangeRates/reducer'

jest.mock('../../../common/InstitutionIcon/importLogos', () => [])
jest.mock('uuid/v4', () => jest.fn(() => 'xyz'))

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

const mochHistoryPush = jest.fn()

describe('Dashboard', () => {
  it('matches snapshot with no accounts', () => {
    const mockStore = configureMockStore()
    const store = mockStore({
      settings: settingsInitialState,
      accounts: accountsInitialState,
      budget: budgetInitialState
    })
    const wrapper = mount((
      <BrowserRouter>
        <Provider store={store}>
          <Dashboard history={{ push: mochHistoryPush }} />
        </Provider>
      </BrowserRouter>
    ))
    expect(wrapper.debug()).toMatchSnapshot()

    const component = wrapper.findWhere(node => node.name() === 'DashboardComponent')
    expect(component.props().accounts).toEqual(accountsInitialState)
    expect(component.props().totalBalance).toEqual(0)
  })

  it('matches snapshot with one account', async () => {
    const mockStore = configureMockStore()
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

    const wrapper = mount((
      <BrowserRouter>
        <Provider store={store}>
          <Dashboard history={{ push: mochHistoryPush }} />
        </Provider>
      </BrowserRouter>
    ))
    expect(wrapper.debug()).toMatchSnapshot()

    const component = wrapper.findWhere(node => node.name() === 'DashboardComponent')
    expect(component.props().accounts).toEqual(store.getState().accounts)
    expect(component.props().totalBalance).toEqual(accounts[0].currentBalance.localCurrency)
  })

  it('matches snapshot with two accounts in a different currency', async () => {
    const mockStore = configureMockStore()
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

    const wrapper = mount((
      <BrowserRouter>
        <Provider store={store}>
          <Dashboard history={{ push: mochHistoryPush }} />
        </Provider>
      </BrowserRouter>
    ))
    expect(wrapper.debug()).toMatchSnapshot()

    const component = wrapper.findWhere(node => node.name() === 'DashboardComponent')
    expect(component.props().accounts).toEqual(store.getState().accounts)
    expect(component.props().totalBalance).toEqual(
      accounts[0].currentBalance.localCurrency + accounts[1].currentBalance.localCurrency
    )
  })
})
