import uuid from 'uuid/v4'
import types from './types'
import { saveState } from '../user/actions'

export const loadBudget = (budget) => {
  return { type: types.LOAD_BUDGET, payload: budget }
}

export const afterCategoriesChanged = () => {
  saveState()
}

export const createCategory = (category, parentId) => (dispatch) => {
  dispatch({
    type: types.CREATE_CATEGORY,
    payload: { category: { ...category, id: uuid(), parentId } }
  })
  afterCategoriesChanged()
}

export const updateCategory = category => (dispatch) => {
  dispatch({ type: types.UPDATE_CATEGORY, payload: category })
  afterCategoriesChanged()
}

export const deleteCategory = categoryId => (dispatch) => {
  dispatch({ type: types.DELETE_CATEGORY, payload: categoryId })
  afterCategoriesChanged()
}

export const createExactRule = (categoryId, match) => (
  { type: types.CREATE_EXACT_RULE, payload: { categoryId, match } }
)

export const deleteExactRule = match => (
  { type: types.DELETE_EXACT_RULE, payload: match }
)

export const countRuleUsage = () => (dispatch, getState) => (
  dispatch({ type: types.COUNT_RULE_USAGE, payload: getState().transactions.list })
)
