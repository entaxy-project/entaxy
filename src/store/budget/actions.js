/* eslint-disable import/no-cycle */
import uuid from 'uuid/v4'
import types from './types'
import { showSnackbar } from '../settings/actions'
import { updateTransactionFieldIfMatched } from '../transactions/actions'

export const loadBudget = (budget) => {
  return { type: types.LOAD_BUDGET, payload: budget }
}

export const createCategory = (category, parentId) => (dispatch) => {
  dispatch({
    type: types.CREATE_CATEGORY,
    payload: {
      ...category,
      id: uuid(),
      ...(parentId === undefined ? {} : { parentId })
    }
  })
  dispatch(showSnackbar({ text: `${parentId === undefined ? 'Group' : 'Category'} created`, status: 'success' }))
}

export const updateCategory = (category) => (dispatch) => {
  dispatch({ type: types.UPDATE_CATEGORY, payload: category })
  dispatch(showSnackbar({
    text: `${category.parentId === undefined ? 'Group' : 'Category'} updated`,
    status: 'success'
  }))
}

export const deleteCategory = (categoryId) => (dispatch, getState) => {
  const { budget } = getState()
  const category = budget.categoriesById[categoryId]
  let categoryIds = [category.id]
  if (!('parentId' in category)) {
    categoryIds = Object.values(budget.categoriesById).reduce((res, cat) => (
      cat.parentId === category.id ? [...res, cat.id] : res
    ), categoryIds)
  }
  dispatch({ type: types.DELETE_CATEGORY, payload: category.id })
  dispatch(updateTransactionFieldIfMatched({
    fieldName: 'categoryId',
    values: categoryIds,
    newValue: undefined
  }))
  dispatch(showSnackbar({
    text: `${category.parentId === undefined ? 'Group' : 'Category'} deleted`,
    status: 'success'
  }))
}

export const createExactRule = (categoryId, match) => (
  { type: types.CREATE_EXACT_RULE, payload: { categoryId, match } }
)

export const deleteExactRule = (match) => (
  { type: types.DELETE_EXACT_RULE, payload: match }
)

export const countRuleUsage = () => (dispatch, getState) => (
  dispatch({ type: types.COUNT_RULE_USAGE, payload: getState().transactions.list })
)
