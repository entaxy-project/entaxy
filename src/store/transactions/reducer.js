import _ from 'lodash'
import types from './types'

export const initialState = {
  list: [],
  sortBy: 'createdAt',
  sortDirection: 'DESC'
}

export default (state = initialState, action) => {
  let index = null

  const findTransactionById = id => (
    _.findIndex(state.list, transaction => transaction.id === id)
  )

  switch (action.type) {
    case types.LOAD_TRANSACTIONS:
      return action.payload || initialState
    case types.CREATE_TRANSACTION:
      return {
        ...state,
        list: [...state.list, action.payload]
      }
    case types.UPDATE_TRANSACTION:
      index = findTransactionById(action.payload.id)
      return {
        ...state,
        list: [...state.list.slice(0, index), action.payload, ...state.list.slice(index + 1)]
      }
    case types.DELETE_TRANSACTIONS:
      return {
        ...state,
        list: state.list.filter(transaction => action.payload.indexOf(transaction.id) === -1)
      }
    case types.ADD_TRANSACTIONS:
      return {
        ...state,
        list: [...state.list, ...action.payload]
      }
    case types.UPDATE_SORT_BY:
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortDirection: action.payload.sortDirection
      }
    default:
      return state
  }
}
