import _ from 'lodash'
import types from './types'

export const initialState = {
  selectedAccountId: null,
  portfolioFilters: {
    institution: {},
    account: {}
  }
}

export default (state = initialState, action) => {
  switch (action.type) {
    case types.LOAD_SETTINGS:
      return action.payload || initialState
    case types.CREATE_PORTFOLIO_FILTERS:
      return {
        ...state,
        portfolioFilters: {
          ...state.portfolioFilters,
          [action.payload.filterName]: {
            ...state.portfolioFilters[action.payload.filterName],
            ...action.payload.options
          }
        }
      }
    case types.DELETE_PORTFOLIO_FILTERS:
      return {
        ...state,
        portfolioFilters: {
          ...state.portfolioFilters,
          [action.payload.filterName]: _.omit(state.portfolioFilters[action.payload.filterName], action.payload.options)
        }
      }
    case types.UPDATE_PORTFOLIO_FILTER_VALUE:
      return {
        ...state,
        portfolioFilters: {
          ...state.portfolioFilters,
          [action.payload.filterName]: {
            ...state.portfolioFilters[action.payload.filterName],
            [action.payload.option]: action.payload.value
          }
        }
      }
    case types.SELECT_ACCOUNT:
      return {
        ...state,
        selectedAccountId: action.payload
      }
    default:
      return state
  }
}
