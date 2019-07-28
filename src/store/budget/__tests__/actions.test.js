import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as actions from '../actions'
import types from '../types'
import { initialState as budgetInitialState } from '../reducer'

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

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

  it('should create an exact rule', async () => {
    const mockStore = configureMockStore([thunk])
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
    const mockStore = configureMockStore([thunk])
    const store = mockStore()
    const match = 'Shopping Mart'
    await store.dispatch(actions.deleteExactRule(match))
    expect(store.getActions()).toEqual([{
      type: 'DELETE_EXACT_RULE',
      payload: match
    }])
  })

  it('should count rules usage', async () => {
    const mockStore = configureMockStore([thunk])
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
