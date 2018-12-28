import uuid from 'uuid/v4'
import types from './types'
import { saveState } from '../user/actions'
import { updatePortfolioFilters } from '../settings/actions'
import { updateMarketValues } from '../marketValues/actions'

export const afterTransactionsChanged = async (dispatch) => {
  await dispatch(updateMarketValues())
  await dispatch(updatePortfolioFilters())
  await saveState()
}

export const createTransaction = (transaction) => {
  return (dispatch) => {
    dispatch({ type: types.CREATE_TRANSACTION, payload: { ...transaction, id: uuid() } })
    return afterTransactionsChanged(dispatch)
  }
}

export const updateTransaction = (transaction) => {
  return async (dispatch) => {
    dispatch({ type: types.UPDATE_TRANSACTION, payload: transaction })
    return afterTransactionsChanged(dispatch)
  }
}

export const deleteTransactions = (transactionIds) => {
  return (dispatch) => {
    dispatch({ type: types.DELETE_TRANSACTIONS, payload: transactionIds })
    return afterTransactionsChanged(dispatch)
  }
}

// Load all the transactions from storage
// Replaces existing transactions
export const loadTransactions = (transactions) => {
  return { type: types.LOAD_TRANSACTIONS, payload: transactions }
}

// Add new transactions to the existing ones
export const addTransactions = (transactions) => {
  return (dispatch) => {
    dispatch({ type: types.ADD_TRANSACTIONS, payload: transactions })
    return afterTransactionsChanged(dispatch)
  }
}

export const updateSortBy = (sortBy, sortDirection) => {
  return { type: types.UPDATE_SORT_BY, payload: { sortBy, sortDirection } }
}
