import uuid from 'uuid/v4'
import types from './types'

export const addTransaction = (transaction) => {
  return { type: types.ADD_TRANSACTION, payload: { ...transaction, id: uuid() } }
}

export const loadTransactions = (transactions) => {
  return { type: types.LOAD_TRANSACTIONS, payload: transactions }
}
