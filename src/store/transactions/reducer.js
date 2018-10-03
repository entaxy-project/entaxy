import _ from 'lodash'
import types from './types'

export const initialState = []

export default (state = initialState, action) => {
  let index = null

  switch (action.type) {
    case types.LOAD_TRANSACTIONS:
      return action.payload || initialState
    case types.CREATE_TRANSACTION:
      return [...state, action.payload]
    case types.UPDATE_TRANSACTION:
      index = _.findIndex(state, transaction => transaction.id === action.payload.id)
      return [...state.slice(0, index), action.payload, ...state.slice(index + 1)]
    case types.DELETE_TRANSACTION:
      index = _.findIndex(state, transaction => transaction.id === action.payload)
      return [...state.slice(0, index), ...state.slice(index + 1)]
    case types.ADD_TRANSACTIONS:
      return [...state, ...action.payload]
    default:
      return state
  }
}
