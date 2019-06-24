import _ from 'lodash'
import types from './types'

export const initialState = {}

export default (state = initialState, action) => {
  switch (action.type) {
    case types.LOAD_EXCHANGE_RATES:
      return action.payload || initialState
    case types.CREATE_EXCHANGE_RATE:
      return {
        ...state,
        [action.payload.currency]: {
          exchangeRate: action.payload.exchangeRate,
          updatedOn: action.payload.updatedOn
        }
      }
    case types.UPDATE_EXCHANGE_RATE:
      return {
        ...state,
        [action.payload.currency]: {
          exchangeRate: action.payload.exchangeRate,
          updatedOn: action.payload.updatedOn
        }
      }
    case types.DELETE_CURRENCIES:
      return _.omit(state, action.payload)
    default:
      return state
  }
}
