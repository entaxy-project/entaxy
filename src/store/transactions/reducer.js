/* eslint-disable no-case-declarations */
import types from './types'

export const initialState = {
  list: []
}

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case types.LOAD_TRANSACTIONS:
      return payload || initialState
    case types.CREATE_TRANSACTION:
      return {
        ...state,
        list: [...state.list, payload]
      }
    case types.UPDATE_TRANSACTION:
      return {
        ...state,
        list: state.list.map((transaction) => {
          if (transaction.id === payload.id) {
            return { ...transaction, ...payload }
          }
          return transaction
        })
      }
    case types.UPDATE_TRANSACTIONS:
      // payload has the format { id1: transaction1,  id2: transaction2, ... }
      return {
        ...state,
        list: state.list.map((transaction) => {
          if (transaction.id.toString() in payload) {
            return { ...transaction, ...payload[transaction.id] }
          }
          return transaction
        })
      }
    case types.DELETE_TRANSACTIONS:
      return {
        ...state,
        list: state.list.filter((transaction) => payload.indexOf(transaction.id) === -1)
      }
    case types.ADD_TRANSACTIONS:
      return {
        ...state,
        list: [...state.list, ...payload]
      }
    case types.UPATE_TRANSACTION_FIELD_IF_MATCHED:
      return {
        ...state,
        list: state.list.reduce((result, transaction) => ([
          ...result,
          {
            ...transaction,
            categoryId: payload.values.includes(transaction[payload.fieldName])
              ? payload.newValue
              : transaction[payload.fieldName]
          }
        ]), [])
      }
    default:
      return state
  }
}
