/* eslint-disable import/no-cycle */
import uuid from 'uuid/v4'
import types from './types'
import { showSnackbar } from '../user/actions'
import { updateTransactions, updateTransactionFieldIfMatched } from '../transactions/actions'

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

export const createRule = (rule) => (dispatch) => {
  const id = uuid()
  dispatch({ type: types.CREATE_RULE, payload: { ...rule, id } })
  return id
}

export const updateRule = (rule) => (
  { type: types.UPDATE_RULE, payload: rule }
)

export const deleteRule = (ruleId) => (
  { type: types.DELETE_RULE, payload: ruleId }
)

export const transactionMatches = (transaction, accountId, filter) => {
  if (!filter) return false
  if (transaction.accountId !== accountId) return false
  if (!filter.description && !filter.amount) return false

  let res = true
  const { description, amount } = transaction
  if (filter.description && filter.description.value) {
    switch (filter.description.type) {
      case 'equals':
        res = res && description === filter.description.value
        break
      case 'start_with':
        res = res && description.startsWith(filter.description.value)
        break
      case 'end_with':
        res = res && description.endsWith(filter.description.value)
        break
      case 'contain':
        res = res && description.includes(filter.description.value)
        break
      default:
        res = false
    }
  }
  if (filter.amount && filter.amount.value && amount) {
    switch (filter.amount.type) {
      case 'equals':
        res = res && amount.accountCurrency === filter.amount.value
        break
      default:
        res = false
    }
  }
  return res
}

// If the rule is not found then the category is cleared from matching transactions
export const applyRule = (rule, { clearAttributes = false } = {}) => (dispatch, getState) => {
  const unusedRules = new Set()
  const changes = getState().transactions.list.reduce((result, transaction) => {
    if (transactionMatches(transaction, rule.accountId, rule.filterBy)) {
      let {
        ruleId,
        categoryId,
        transferAccountId,
        transferDirection,
        // eslint-disable-next-line prefer-const
        ...rest
      } = transaction

      // Reset all attributes
      ruleId = null
      categoryId = null
      transferAccountId = null
      transferDirection = null

      // This transaction was already matching a different rule
      // so we need to delete the old rule
      if (transaction.ruleId && transaction.ruleId !== rule.id) {
        unusedRules.add(transaction.ruleId)
      }
      if (!clearAttributes) {
        if (rule.id) {
          ruleId = rule.id
        }
        if (rule.attributes) {
          if ('categoryId' in rule.attributes) {
            categoryId = rule.attributes.categoryId
          }
          if ('transfer' in rule.attributes) {
            transferAccountId = rule.attributes.transfer.accountId
            transferDirection = rule.attributes.transfer.direction
          }
        }
      }

      return {
        ...result,
        [transaction.id]: {
          ...rest,
          ...(ruleId && { ruleId }),
          ...(categoryId && { categoryId }),
          ...(transferAccountId && { transferAccountId }),
          ...(transferDirection && { transferDirection })
        }
      }
    }
    return result
  }, [])
  if (Object.keys(changes).length > 0) dispatch(updateTransactions(changes))
  Array.from(unusedRules, (ruleId) => dispatch(deleteRule(ruleId)))
}
