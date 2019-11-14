import React from 'react'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import BudgetIndex from '..'
import { initialState as accountsInitialState } from '../../../store/accounts/reducer'
import { initialState as transactionsInitialState } from '../../../store/transactions/reducer'
import { initialState as budgetInitialState } from '../../../store/budget/reducer'
import { initialState as settingsInitialState } from '../../../store/settings/reducer'

describe('BudgetIndex', () => {
  it('matches snapshot with no accounts', () => {
    const mockStore = configureMockStore()
    const store = mockStore({
      accounts: accountsInitialState,
      transactions: transactionsInitialState,
      budget: budgetInitialState,
      settings: settingsInitialState
    })
    const wrapper = mount((
      <Provider store={store}>
        <BudgetIndex />
      </Provider>
    ))
    expect(wrapper.debug()).toMatchSnapshot()
  })
})
