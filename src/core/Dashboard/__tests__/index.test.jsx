import React from 'react'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import store from '../../../store'
import Dashboard from '../'
import { createAccount } from '../../../store/accounts/actions'

const account = {
  description: 'Checking',
  institution: 'TD',
  currency: 'CAD',
  openingBalance: 10
}

describe('Dashboard', () => {
  describe('snapshot', () => {
    it('matches with no accounts', () => {
      const wrapper = mount((
        <Provider store={store}>
          <Dashboard />
        </Provider>
      ))
      expect(wrapper.debug()).toMatchSnapshot()

      const component = wrapper.findWhere(node => node.name() === '')
      expect(component.props().totalBalance).toEqual(0)
      expect(component.props().groupedAccounts).toEqual({})
      expect(component.props().formatCurrency(10000)).toEqual('$10,000.00')
    })

    it('matches with one account', async () => {
      account.id = await store.dispatch(createAccount(account))
      const wrapper = mount((
        <Provider store={store}>
          <Dashboard />
        </Provider>
      ))
      expect(wrapper.debug()).toMatchSnapshot()

      const component = wrapper.findWhere(node => node.name() === '')
      expect(component.props().totalBalance).toEqual(10)
      expect(component.props().groupedAccounts).toEqual(store.getState().accounts.byInstitution)
      expect(component.props().formatCurrency(10000)).toEqual('$10,000.00')
    })
  })
})
