import types from './types'

export const initialState = []

export default (state = initialState, action) => {
  switch (action.type) {
    case types.ADD_TRANSACTION:
      return [...state, action.payload]
    case types.LOAD_TRANSACTIONS:
      return action.payload
    default:
      return state
  }
}
