/* eslint-disable import/no-cycle */
import uuid from 'uuid/v4'
import pluralize from 'pluralize'
import types from './types'
import { saveState } from '../user/actions'
import { updateAccount } from '../accounts/actions'
import { showSnackbar } from '../settings/actions'

export const afterTransactionsChanged = account => async (dispatch) => {
  await dispatch(updateAccount(account, { forceUpdateBalance: true, showMessage: false }))
  saveState()
}

export const createTransaction = (account, transaction) => async (dispatch) => {
  dispatch({ type: types.CREATE_TRANSACTION, payload: { ...transaction, id: uuid(), accountId: account.id } })
  await dispatch(afterTransactionsChanged(account))
  dispatch(showSnackbar({ text: 'Transaction created', status: 'success' }))
}

export const updateTransaction = (account, transaction) => async (dispatch) => {
  dispatch({ type: types.UPDATE_TRANSACTION, payload: transaction })
  await dispatch(afterTransactionsChanged(account))
  dispatch(showSnackbar({ text: 'Transaction updated', status: 'success' }))
}

export const deleteTransactions = (account, transactionIds, options = { skipAfterChange: false }) => {
  const { skipAfterChange } = options
  return async (dispatch) => {
    dispatch({ type: types.DELETE_TRANSACTIONS, payload: transactionIds })
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
      payload: transactions.map(t => Object.assign(t, { id: uuid(), accountId: account.id }))
    })
    if (!skipAfterChange) {
      await dispatch(afterTransactionsChanged(account))
    }
  }
}

export const getAccountTransactions = ({ transactions }, accountId) => {
  return transactions.list.filter(transaction => transaction.accountId === accountId)
}
