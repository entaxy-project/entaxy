import uuid from 'uuid/v4'
import types from './types'
import { updateAccount } from '../accounts/actions'
import { updateMarketValues } from '../marketValues/actions'

export const afterTransactionsChanged = async (dispatch, account) => {
  await dispatch(updateMarketValues())
  await dispatch(updateAccount(account))
}

export const createTransaction = (account, transaction) => {
  return (dispatch) => {
    dispatch({ type: types.CREATE_TRANSACTION, payload: { ...transaction, id: uuid() } })
    return afterTransactionsChanged(dispatch, account)
  }
}

export const updateTransaction = (account, transaction) => {
  return async (dispatch) => {
    dispatch({ type: types.UPDATE_TRANSACTION, payload: transaction })
    return afterTransactionsChanged(dispatch, account)
  }
}

export const deleteTransactions = (account, transactionIds) => {
  return (dispatch) => {
    dispatch({ type: types.DELETE_TRANSACTIONS, payload: transactionIds })
    return afterTransactionsChanged(dispatch, account)
  }
}

// Load all the transactions from storage
// Replaces existing transactions
export const loadTransactions = (transactions) => {
  return { type: types.LOAD_TRANSACTIONS, payload: transactions }
}

// Add new transactions to the existing ones
export const addTransactions = (account, transactions) => {
  return async (dispatch) => {
    await dispatch({ type: types.ADD_TRANSACTIONS, payload: transactions })
    return afterTransactionsChanged(dispatch, account)
  }
}

export const updateSortBy = (sortBy, sortDirection) => {
  return { type: types.UPDATE_SORT_BY, payload: { sortBy, sortDirection } }
}
