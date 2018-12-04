import _ from 'lodash'
import types from './types'

export const initialState = []

export default (state = initialState, action) => {
  let index = null

  switch (action.type) {
    case types.LOAD_ACCOUNTS:
      return action.payload || initialState
    case types.CREATE_ACCOUNT:
      return [...state, action.payload]
    case types.UPDATE_ACCOUNT:
      index = _.findIndex(state, account => account.id === action.payload.id)
      return [...state.slice(0, index), action.payload, ...state.slice(index + 1)]
    case types.DELETE_ACCOUNT:
      return state.filter(account => action.payload !== account.id)
    default:
      return state
  }
}
