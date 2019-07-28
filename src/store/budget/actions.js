import types from './types'

export const loadBudget = (budget) => {
  return { type: types.LOAD_BUDGET, payload: budget }
}

export const createCategory = category => (
  { type: types.CREATE_CATEGORY, payload: category }
)

export const updateCategory = category => (
  { type: types.UPDATE_CATEGORY, payload: category }
)

export const createExactRule = (categoryId, match) => (
  { type: types.CREATE_EXACT_RULE, payload: { categoryId, match } }
)

export const deleteExactRule = match => (
  { type: types.DELETE_EXACT_RULE, payload: match }
)

export const countRuleUsage = () => (dispatch, getState) => (
  dispatch({ type: types.COUNT_RULE_USAGE, payload: getState().transactions.list })
)
