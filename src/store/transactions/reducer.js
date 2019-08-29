/* eslint-disable no-case-declarations */
import _ from 'lodash'
import types from './types'

export const initialState = {
  list: []
}

export default (state = initialState, { type, payload }) => {
  let index = null

  const findTransactionById = (id) => (
    _.findIndex(state.list, (transaction) => transaction.id === id)
  )

  switch (type) {
    case types.LOAD_TRANSACTIONS:
      return payload || initialState
    case types.CREATE_TRANSACTION:
      return {
        ...state,
        list: [...state.list, payload]
      }
    case types.UPDATE_TRANSACTION:
      index = findTransactionById(payload.id)
      return {
        ...state,
        list: [...state.list.slice(0, index), payload, ...state.list.slice(index + 1)]
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
    case types.APPLY_EXACT_RULE:
      // eslint-disable-next-line no-case-declarations
      const { match, rules } = payload
      return {
        ...state,
        list: state.list.reduce((result, transaction) => {
          if (transaction.description === match) {
            return [
              ...result,
              {
                ...transaction,
                categoryId: transaction.description in rules
                  ? rules[transaction.description].categoryId
                  : undefined
              }
            ]
          }
          return [...result, transaction]
        }, [])
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
