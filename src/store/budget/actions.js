import types from './types'

export const loadBudget = (budget) => {
  return { type: types.LOAD_BUDGET, payload: budget }
}

export const createExactRule = (category, match) => (
  { type: types.CREATE_EXACT_RULE, payload: { category, match } }
)

export const deleteExactRule = match => (
  { type: types.DELETE_EXACT_RULE, payload: match }
)

export const countRuleUsage = () => (dispatch, getState) => (
  dispatch({ type: types.COUNT_RULE_USAGE, payload: getState().transactions.list })
)
