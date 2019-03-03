import React from 'react'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import store from '../../../store'
import Dashboard from '..'
import { updateSettings } from '../../../store/settings/actions'
import { createAccount } from '../../../store/accounts/actions'
import { initialState as accountsInitialState } from '../../../store/accounts/reducer'
import { initialState as settingsInitialState } from '../../../store/settings/reducer'

jest.mock('../../../common/InstitutionIcon/importLogos', () => [])

const accounts = [{
  description: 'Checking',
  institution: 'TD',
  currency: 'CAD',
  openingBalance: 10
}, {
  description: 'Savings',
  institution: 'TD',
  currency: 'EUR',
  openingBalance: 10
}]

describe('Dashboard', () => {
  it('matches snapshot with no accounts', () => {
    const wrapper = mount((
      <Provider store={store}>
        <Dashboard />
      </Provider>
    ))
    expect(wrapper.debug()).toMatchSnapshot()

    const component = wrapper.findWhere(node => node.name() === 'DashboardComponent')
    expect(component.props().settings).toEqual(settingsInitialState)
    expect(component.props().accounts).toEqual(accountsInitialState)
    expect(component.props().totalBalance).toEqual(0)
    expect(component.props().formatCurrency(10000)).toEqual('$10,000.00')
  })

  it('matches snapshot with one account', async () => {
    accounts[0].id = await store.dispatch(createAccount(accounts[0]))
    const wrapper = mount((
      <Provider store={store}>
        <Dashboard />
      </Provider>
    ))
    expect(wrapper.debug()).toMatchSnapshot()

    const component = wrapper.findWhere(node => node.name() === 'DashboardComponent')
    expect(component.props().settings).toEqual(settingsInitialState)
    expect(component.props().accounts).toEqual(store.getState().accounts)
    expect(component.props().totalBalance).toEqual(10)

    expect(store.getState().settings.locale).toBe('en-US')
    expect(component.props().formatCurrency(10000)).toEqual('$10,000.00')

    await store.dispatch(updateSettings({ locale: 'en-UK', currency: 'EUR' }))
    expect(component.props().formatCurrency(10000)).toEqual('$10,000.00')
  })

  it('matches snapshot with two accounts in a different currency', async () => {
    accounts[1].id = await store.dispatch(createAccount(accounts[1]))
    await store.dispatch(updateSettings({ locale: 'en-UK', currency: 'EUR' }))

    const wrapper = mount((
      <Provider store={store}>
        <Dashboard />
      </Provider>
    ))
    expect(wrapper.debug()).toMatchSnapshot()

    const component = wrapper.findWhere(node => node.name() === 'DashboardComponent')
    expect(component.props().settings).toEqual(store.getState().settings)
    expect(component.props().accounts).toEqual(store.getState().accounts)
    expect(component.props().totalBalance).toEqual(20)
    expect(component.props().formatCurrency(10000)).toEqual('€10,000.00')
  })
})
