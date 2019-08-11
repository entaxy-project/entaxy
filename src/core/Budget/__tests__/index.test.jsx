import React from 'react'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import BudgetIndex from '..'
import { initialState as budgetInitialState } from '../../../store/budget/reducer'

describe('BudgetIndex', () => {
  it('matches snapshot with no accounts', () => {
    const mockStore = configureMockStore()
    const store = mockStore({
      budget: budgetInitialState
    })
    const wrapper = mount((
      <Provider store={store}>
        <BudgetIndex />
      </Provider>
    ))
    expect(wrapper.debug()).toMatchSnapshot()
  })
})
