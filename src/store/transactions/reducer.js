import types from './types'

export const initialState = {
  transactions: []
}

export default (state = initialState, action) => {
  switch (action.type) {
    case types.ADD_TRANSACTION:
      return { ...state, transactions: state.transactions.concat(action.payload) }
    default:
      return state
  }
}
