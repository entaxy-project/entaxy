import _ from 'lodash'
import types from './types'

export const initialState = {
  list: [],
  rules: {} // rules have the format { match: category }
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
    case types.DELETE_EXACT_RULE:
      // eslint-disable-next-line no-case-declarations
      const r = Object.keys(state.rules).reduce((result, match) => {
        if (match !== action.payload) {
          return {
            ...result,
            rules: { ...result.rules, [match]: state.rules[match] }
          }
        }
        return result
      }, { ...state, rules: {} })
      return r
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
