import uuid from 'uuid/v4'
import types from './types'
import { saveState } from '../user/actions'
import { updateAccountBalance } from '../accounts/actions'
// import { updateMarketValues } from '../marketValues/actions'

export const afterTransactionsChanged = account => (dispatch) => {
  // await dispatch(updateMarketValues())
  dispatch(updateAccountBalance(account))
  saveState()
}

export const createTransaction = (account, transaction) => (dispatch) => {
  dispatch({ type: types.CREATE_TRANSACTION, payload: { ...transaction, id: uuid(), accountId: account.id } })
  dispatch(afterTransactionsChanged(account))
}

export const updateTransaction = (account, transaction) => (dispatch) => {
  dispatch({ type: types.UPDATE_TRANSACTION, payload: transaction })
  dispatch(afterTransactionsChanged(account))
}

export const deleteTransactions = (account, transactionIds, options = { skipAfterChange: false }) => {
  const { skipAfterChange } = options
  return (dispatch) => {
    dispatch({ type: types.DELETE_TRANSACTIONS, payload: transactionIds })
    if (!skipAfterChange) {
      dispatch(afterTransactionsChanged(account))
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
  return (dispatch) => {
    dispatch({
      type: types.ADD_TRANSACTIONS,
      payload: transactions.map(t => Object.assign(t, { id: uuid(), accountId: account.id }))
    })
    if (!skipAfterChange) {
      dispatch(afterTransactionsChanged(account))
    }
  }
}

export const updateSortBy = (sortBy, sortDirection) => {
  return { type: types.UPDATE_SORT_BY, payload: { sortBy, sortDirection } }
}

export const getAccountTransactions = (accountId, transactions) => {
  return transactions.filter(transaction => transaction.accountId === accountId)
}
