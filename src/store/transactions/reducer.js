import _ from 'lodash'
import types from './types'

export const initialState = {
  list: [],
  rules: {}
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
    case types.CREATE_EXACT_RULE:
      return {
        ...state,
        rules: { ...state.rules, [action.payload.match]: action.payload.category }
      }
    case types.APPLY_EXACT_RULE:
      return {
        ...state,
        list: state.list.reduce((result, transaction) => {
          if (transaction.description === action.payload) {
            return [
              ...result,
              { ...transaction, category: state.rules[transaction.description] }
            ]
          }
          return [...result, transaction]
        }, [])
      }
    default:
      return state
  }
}
