import React from 'react'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import CategoryForm from '../form'
import { initialState as settingsInitialState } from '../../../store/settings/reducer'
import { initialState as budgetInitialState } from '../../../store/budget/reducer'

jest.mock('uuid/v4', () => {
  let value = 0
  return () => {
    value += 1
    return value
  }
})

describe('CategoryForm', () => {
  const mochHandleCancel = jest.fn()

  it('matches snapshot for new category', async () => {
    const budget = budgetInitialState
    const groupId = budgetInitialState.categoryTree[0].id
    const group = budget.categoriesById[groupId]
    expect(('parentId' in budget.categoriesById[group.id])).toBe(false)

    const mockStore = configureMockStore()
    const store = mockStore({
      settings: settingsInitialState,
      budget: budgetInitialState
    })

    const wrapper = mount((
      <Provider store={store}>
        <CategoryForm
          group={group}
          handleCancel={mochHandleCancel}
        />
      </Provider>
    ))
    expect(wrapper.debug()).toMatchSnapshot()
  })

  it('matches snapshot for existing category', () => {
    const budget = budgetInitialState
    const groupId = budget.categoryTree[0].id
    const group = budget.categoriesById[groupId]
    expect(('parentId' in budget.categoriesById[group.id])).toBe(false)
    const category = budget.categoriesById[budget.categoryTree[0].options[0].id]
    expect(('parentId' in budget.categoriesById[category.id])).toBe(true)

    const mockStore = configureMockStore()
    const store = mockStore({
      settings: settingsInitialState,
      budget
    })
    const wrapper = mount((
      <Provider store={store}>
        <CategoryForm
          category={category}
          group={group}
          handleCancel={mochHandleCancel}
        />
      </Provider>
    ))
    expect(wrapper.debug()).toMatchSnapshot()
  })
})
