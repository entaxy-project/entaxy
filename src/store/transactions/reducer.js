/* eslint-disable no-case-declarations */
import types from './types'

export const initialState = {
  list: []
}

export const getInsertIndexOf = (element, sortBy, array) => {
  let low = 0
  let high = array.length

  while (low < high) {
    // eslint-disable-next-line no-bitwise
    const mid = (low + high) >>> 1 // divide by 2
    if (array[mid][sortBy] < element[sortBy]) {
      low = mid + 1
    } else {
      high = mid
    }
  }
  return low
}

export const insertSorted = (element, array) => {
  const index = getInsertIndexOf(element, 'createdAt', array)
  return [...array.slice(0, index), element, ...array.slice(index)]
}

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case types.LOAD_TRANSACTIONS:
      return payload || initialState
    case types.CREATE_TRANSACTION:
      return {
        ...state,
        list: insertSorted(payload, state.list)
      }
    case types.UPDATE_TRANSACTION:
      return {
        ...state,
        list: state.list.map((transaction) => {
          return transaction.id === payload.id ? payload : transaction
        })
      }
    case types.UPDATE_TRANSACTIONS:
      // payload has the format { id1: transaction1,  id2: transaction2, ... }
      return {
        ...state,
        list: state.list.map((transaction) => {
          return transaction.id in payload ? payload[transaction.id] : transaction
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
