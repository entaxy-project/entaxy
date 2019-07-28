import _ from 'lodash'
import types from './types'

export const initialState = {
  list: []
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
    case types.APPLY_EXACT_RULE:
      // eslint-disable-next-line no-case-declarations
      const { match, rules } = action.payload
      return {
        ...state,
        list: state.list.reduce((result, transaction) => {
          if (transaction.description === match) {
            return [
              ...result,
              {
                ...transaction,
                categoryId: transaction.description in rules ? rules[transaction.description].categoryId : undefined
              }
            ]
          }
          return [...result, transaction]
        }, [])
      }
    default:
      return state
  }
}
