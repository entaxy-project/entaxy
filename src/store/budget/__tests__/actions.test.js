import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as actions from '../actions'
import types from '../types'
import { initialState as budgetInitialState } from '../reducer'


// jest.mock('uuid/v4', () => jest.fn(() => {'xyz'}))
jest.mock('uuid/v4', () => {
  let value = 0
  return () => {
    value += 1
    return value
  }
})

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

const mockStore = configureMockStore([thunk])
const transaction = {
  accountId: 1,
  description: 'Shopping Mart',
  amount: 1,
  createdAt: Date.now()
}

const budget = {
  ...budgetInitialState,
  rules: {
    'Shopping Mart': budgetInitialState.categoryTree[2].options[0].label
  }
}

describe('budget actions', () => {
  it('should load budget', () => {
    expect(actions.loadBudget(budget)).toEqual({
      type: types.LOAD_BUDGET,
      payload: budget
    })
  })

  describe('categories', () => {
    it('should create a group', async () => {
      const store = mockStore({})
      await store.dispatch(actions.createCategory({ name: 'group 1' }))
      expect(store.getActions()).toEqual([{
        type: 'CREATE_CATEGORY',
        payload: { name: 'group 1', id: Object.keys(budgetInitialState.categoriesById).length + 1 }
      }])
    })

    it('should create a category', async () => {
      const store = mockStore({ budget })
      await store.dispatch(actions.createCategory({ name: 'cat 1' }, 1))
      expect(store.getActions()).toEqual([{
        type: 'CREATE_CATEGORY',
        payload: {
          name: 'cat 1',
          id: Object.keys(budgetInitialState.categoriesById).length + 2,
          parentId: 1
        }
      }])
    })

    it('should update a group', async () => {
      const store = mockStore({ budget })
      await store.dispatch(actions.updateCategory({ id: 0, name: 'group 1' }))
      expect(store.getActions()).toEqual([{
        type: 'UPDATE_CATEGORY',
        payload: { name: 'group 1', id: 0 }
      }])
    })

    it('should delete a group', async () => {
      const store = mockStore({ budget })
      await store.dispatch(actions.deleteCategory(0))
      expect(store.getActions()).toEqual([{
        type: 'DELETE_CATEGORY',
        payload: 0
      }])
    })
  })

  describe('rules', () => {
    it('should create an exact rule', async () => {
      const store = mockStore({})
      const category = budgetInitialState.categoryTree[2]
      const match = 'Shopping Mart'
      await store.dispatch(actions.createExactRule(category.id, match))
      expect(store.getActions()).toEqual([{
        type: 'CREATE_EXACT_RULE',
        payload: { categoryId: category.id, match }
      }])
    })

    it('should delete an exact rule', async () => {
      const store = mockStore()
      const match = 'Shopping Mart'
      await store.dispatch(actions.deleteExactRule(match))
      expect(store.getActions()).toEqual([{
        type: 'DELETE_EXACT_RULE',
        payload: match
      }])
    })

    it('should count rules usage', async () => {
      const store = mockStore({
        transactions: {
          list: [transaction]
        }
      })
      await store.dispatch(actions.countRuleUsage())
      expect(store.getActions()).toEqual([{
        type: 'COUNT_RULE_USAGE',
        payload: [transaction]
      }])
    })
  })
})
