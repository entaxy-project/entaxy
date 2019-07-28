import budgetReducer, { initialState } from '../reducer'
import types from '../types'

const budget = {
  ...initialState,
  rules: {
    'Shoppint Mart': 'Groceries'
  }
}

describe('budget reducer', () => {
  it('should return initial state', () => {
    expect(budgetReducer(undefined, {})).toEqual(initialState)
  })

  it('should handle LOAD_BUDGET', () => {
    const type = types.LOAD_BUDGET
    const payload = budget
    expect(budgetReducer(undefined, { type, payload })).toEqual(payload)
  })

  it('should handle LOAD_BUDGET with no existing data', () => {
    const type = types.LOAD_BUDGET
    const payload = null
    expect(budgetReducer(undefined, { type, payload })).toEqual(initialState)
  })

  describe('CREATE_EXACT_RULE', () => {
    it('should create a new rule', () => {
      const type = types.CREATE_EXACT_RULE
      const payload = { match: 'Shopping Mart', categoryId: 1 }
      expect(budgetReducer(initialState, { type, payload })).toEqual({
        ...initialState,
        rules: {
          [payload.match]: {
            categoryId: payload.categoryId,
            count: 0,
            type: 'exact_match'
          }
        }
      })
    })

    it('should update an existing rule', () => {
      const type = types.CREATE_EXACT_RULE
      const payload = { match: 'Shopping Mart', categoryId: 1 }
      expect(budgetReducer({ rules: { 'Shopping Mart': 'b' } }, { type, payload })).toEqual({
        rules: {
          [payload.match]: {
            categoryId: payload.categoryId,
            count: 0,
            type: 'exact_match'
          }
        }
      })
    })
  })

  describe('DELETE_EXACT_RULE', () => {
    it('should delete a new rule', () => {
      const type = types.DELETE_EXACT_RULE
      const payload = { match: 'Shopping Mart', category: 'Groceries' }
      const state = {
        rules: {
          abc: {
            category: 'xyz',
            count: 1,
            type: 'exact_match'
          },
          [payload.match]: {
            category: payload.category,
            count: 0,
            type: 'exact_match'
          }
        }
      }
      expect(budgetReducer(state, { type, payload: payload.match })).toEqual({
        rules: {
          abc: {
            category: 'xyz',
            count: 1,
            type: 'exact_match'
          }
        }
      })
    })
  })

  describe('COUNT_RULE_USAGE', () => {
    it('should count used rules and remove unused ones', () => {
      const type = types.COUNT_RULE_USAGE
      const payload = [
        { id: 2, description: 'aaa', category: 'xyz' },
        { id: 3, description: 'def' }
      ]
      const state = {
        rules: {
          aaa: {
            category: 'xyz',
            count: 0,
            type: 'exact_match'
          },
          bbb: {
            category: 'xyz',
            count: 0,
            type: 'exact_match'
          }

        }
      }
      expect(budgetReducer(state, { type, payload })).toEqual({
        rules: {
          aaa: {
            category: 'xyz',
            count: 1,
            type: 'exact_match'
          }
        }
      })
    })
  })
})
