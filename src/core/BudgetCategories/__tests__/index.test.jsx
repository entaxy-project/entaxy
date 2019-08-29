import React from 'react'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import BudgetCategories from '..'
import { initialState as settingsInitialState } from '../../../store/settings/reducer'
import { initialState as budgetInitialState } from '../../../store/budget/reducer'

describe('BudgetCAtegoriesIndex', () => {
  it('matches snapshot with no accounts', () => {
    const mockStore = configureMockStore()
    const store = mockStore({
      settings: settingsInitialState,
      budget: budgetInitialState
    })
    const wrapper = mount((
      <BrowserRouter>
        <Provider store={store}>
          <BudgetCategories />
        </Provider>
      </BrowserRouter>
    ))
    expect(wrapper.debug()).toMatchSnapshot()

    const groupNames = budgetInitialState.categoryTree.map((cat) => cat.label)
    expect(wrapper.find('h6').map((node) => node.text())).toEqual(groupNames)
  })
})
