/* eslint-disable import/no-cycle */
import uuid from 'uuid/v4'
import pluralize from 'pluralize'
import types from './types'
import { saveState } from '../user/actions'
import { updateAccount } from '../accounts/actions'
import { showSnackbar } from '../settings/actions'
import { fetchExchangeRates } from '../exchangeRates/actions'
import { createExactRule, deleteExactRule, countRuleUsage } from '../budget/actions'

export const afterTransactionsChanged = (account) => async (dispatch) => {
  await dispatch(updateAccount(account, { forceUpdateBalance: true, showMessage: false }))
  saveState()
}

// If the rule is not found then the category is cleared from matching transactions
export const applyExactRule = ({ match, rules }) => (
  { type: types.APPLY_EXACT_RULE, payload: { match, rules } }
)

export const createTransaction = (account, transaction, options = {}) => async (dispatch, getState) => {
  await dispatch(fetchExchangeRates([account.currency], transaction.createdAt))
  const id = uuid()
  dispatch({
    type: types.CREATE_TRANSACTION,
    payload: {
      ...transaction,
      id,
      accountId: account.id,
      createdAt: transaction.createdAt + 1000 // Plus 1 second
    }
  })
  if (transaction.categoryId !== undefined && options.createAndApplyRule) {
    dispatch(createExactRule(transaction.categoryId, transaction.description))
    dispatch(applyExactRule({ match: transaction.description, rules: getState().budget.rules }))
    dispatch(countRuleUsage())
  }
  await dispatch(afterTransactionsChanged(account))
  dispatch(showSnackbar({ text: 'Transaction created', status: 'success' }))
  return id
}

export const updateTransaction = (account, transaction, options = {}) => async (dispatch, getState) => {
  const oldTransaction = getState().transactions.list.find((t) => t.id === transaction.id)
  dispatch({
    type: types.UPDATE_TRANSACTION,
    payload: {
      ...transaction,
      createdAt: transaction.createdAt + 1000 // Plus 1 second
    }
  })

  if (transaction.categoryId !== oldTransaction.categoryId || transaction.description !== oldTransaction.description) {
    if (options.createAndApplyRule) {
      if (transaction.categoryId === undefined) {
        dispatch(deleteExactRule(transaction.description))
      } else {
        dispatch(createExactRule(transaction.categoryId, transaction.description))
      }
      dispatch(applyExactRule({ match: transaction.description, rules: getState().budget.rules }))
    }
    dispatch(countRuleUsage())
  }
  await dispatch(afterTransactionsChanged(account))
  dispatch(showSnackbar({ text: 'Transaction updated', status: 'success' }))
}

export const updateTransactionFieldIfMatched = ({ fieldName, values, newValue }) => (
  { type: types.UPATE_TRANSACTION_FIELD_IF_MATCHED, payload: { fieldName, values, newValue } }
)

export const deleteTransactions = (account, transactionIds, options = { skipAfterChange: false }) => {
  const { skipAfterChange } = options
  return async (dispatch) => {
    dispatch({ type: types.DELETE_TRANSACTIONS, payload: transactionIds })
    dispatch(countRuleUsage())
    if (!skipAfterChange) {
      await dispatch(afterTransactionsChanged(account))
      dispatch(showSnackbar({
        text: `${pluralize('transaction', transactionIds.length, true)} deleted`,
        status: 'success'
      }))
    }
  }
}

// Load all the transactions from storage
// Replaces existing transactions
export const loadTransactions = (transactions) => {
  return { type: types.LOAD_TRANSACTIONS, payload: transactions }
}

// Add new transactions to the existing ones
export const addTransactions = (account, transactions, options = { skipAfterChange: false }) => {
  const { skipAfterChange } = options
  return async (dispatch) => {
    dispatch({
      type: types.ADD_TRANSACTIONS,
      payload: transactions.map((t) => Object.assign((t), {
        id: uuid(),
        accountId: account.id,
        createdAt: t.createdAt + 1000 // Plus 1 second
      }))
    })
    dispatch(countRuleUsage())
    if (!skipAfterChange) {
      await dispatch(afterTransactionsChanged(account))
    }
  }
}

export const getAccountTransactions = ({ transactions }, accountId) => {
  return transactions.list.filter((transaction) => transaction.accountId === accountId)
}
