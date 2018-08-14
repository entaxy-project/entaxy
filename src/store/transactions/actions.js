import uuid from 'uuid/v4'
import types from './types'
import store from '../index'
import { saveState } from '../blockstackStorage'


export const storeTransactions = () => {
  saveState(store.getState())
  return null
}

export const createTransaction = (transaction) => {
  return (dispatch) => {
    dispatch({ type: types.CREATE_TRANSACTION, payload: { ...transaction, id: uuid() } })
    dispatch(storeTransactions)
  }
}
export const deleteTransaction = (index) => {
  return (dispatch) => {
    dispatch({ type: types.DELETE_TRANSACTION, payload: index })
    dispatch(storeTransactions)
  }
}

export const loadTransactions = (transactions) => {
  return { type: types.LOAD_TRANSACTIONS, payload: transactions }
}
