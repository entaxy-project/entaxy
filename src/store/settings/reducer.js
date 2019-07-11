import _ from 'lodash'
import types from './types'
import budgetCategories from '../../data/budgetCategories'

// https://projects.susielu.com
// http://repec.sowi.unibe.ch/stata/palettes/index.html
const defaultColours = [
  '#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c',
  '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'
]

const initialBudgetCategories = () => {
  const colours = {}
  const categories = Object.keys(budgetCategories).sort().map(category => (
    {
      label: category,
      options: budgetCategories[category].map((subCategory, index) => {
        const colour = defaultColours[index % defaultColours.length]
        colours[subCategory] = colour
        return { label: subCategory, value: subCategory, colour }
      })
    }
  ))
  return { categories, colours }
}

export const initialState = {
  overlayMessage: null,
  snackbarMessage: null,
  currency: 'USD',
  locale: window.navigator.language || 'en-US',
  budget: initialBudgetCategories(),
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
