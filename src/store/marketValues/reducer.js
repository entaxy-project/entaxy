import _ from 'lodash'
import types from './types'

export const initialState = {}

export default (state = initialState, action) => {
  switch (action.type) {
    case types.LOAD_MARKET_VALUES:
      return action.payload || initialState
    case types.CREATE_MARKET_VALUE:
      return {
        ...state,
        [action.payload.ticker]: {
          marketValue: action.payload.marketValue,
          updatedOn: action.payload.updatedOn
        }
      }
    case types.UPDATE_MARKET_VALUE:
      return {
        ...state,
        [action.payload.ticker]: {
          marketValue: action.payload.marketValue,
          updatedOn: action.payload.updatedOn
        }
      }
    case types.DELETE_MARKET_VALUES:
      return _.omit(state, action.payload)
    default:
      return state
  }
}
