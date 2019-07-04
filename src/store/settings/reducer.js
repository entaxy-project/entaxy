import _ from 'lodash'
import types from './types'
import budgetCategories from '../../data/budgetCategories'

const initialBudgetCategories = () => {
  return Object.keys(budgetCategories).sort().map((category) => {
    const categories = [{
      name: category,
      open: false
    }]
    budgetCategories[category].forEach((subCategory) => {
      categories.push({
        name: subCategory,
        open: false
      })
    })
    return categories
  })
}

export const initialState = {
  overlayMessage: null,
  snackbarMessage: null,
  currency: 'USD',
  locale: window.navigator.language || 'en-US',
  budget: {
    categories: initialBudgetCategories()
  },
  portfolioFilters: {
    institution: {},
    account: {}
  }
}

export default (state = initialState, action) => {
  switch (action.type) {
    case types.SHOW_OVERLAY:
      return { ...state, overlayMessage: action.payload }
    case types.HIDE_OVERLAY:
      return { ...state, overlayMessage: null }
    case types.SHOW_SNACKBAR:
      return { ...state, snackbarMessage: action.payload }
    case types.HIDE_SNACKBAR:
      return { ...state, snackbarMessage: null }
    case types.LOAD_SETTINGS:
      return action.payload || initialState
    case types.UPDATE_SETTINGS:
      return action.payload
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
    default:
      return state
  }
}
