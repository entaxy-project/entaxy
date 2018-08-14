import _ from 'lodash'
import types from './types'

export const initialState = []

export default (state = initialState, action) => {
  let index = null

  switch (action.type) {
    case types.CREATE_TRANSACTION:
      return [...state, action.payload]
    case types.DELETE_TRANSACTION:
      index = _.findIndex(state, transaction => transaction.id === action.payload)
      return [...state.slice(0, index), ...state.slice(index + 1)]
    case types.LOAD_TRANSACTIONS:
      return action.payload
    default:
      return state
  }
}
