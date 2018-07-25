/* eslint-disable import/prefer-default-export */
import types from './types'

export const addTransaction = (transaction) => {
  return { type: types.ADD_TRANSACTION, payload: transaction }
}

export const loadTransactions = (transactions) => {
  return { type: types.LOAD_TRANSACTIONS, payload: transactions }
}
