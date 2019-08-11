import React from 'react'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import BudgetChart from '../BudgetChart'
import { initialState as transactionsInitialState } from '../../../store/transactions/reducer'
import { initialState as settingsInitialState } from '../../../store/settings/reducer'
import { initialState as budgetInitialState } from '../../../store/budget/reducer'

describe('BudgetChart', () => {
  it('matches snapshot with no used categories', () => {
    const mockStore = configureMockStore()
    const store = mockStore({
      transactions: transactionsInitialState,
      settings: settingsInitialState,
      budget: budgetInitialState
    })
    const wrapper = mount((
      <Provider store={store}>
        <BudgetChart />
      </Provider>
    ))
    expect(wrapper.debug()).toMatchSnapshot()
  })
})
