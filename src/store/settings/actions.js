import _ from 'lodash'
import types from './types'
import { saveState } from '../user/actions'

export const loadSettings = (settings) => {
  return { type: types.LOAD_SETTINGS, payload: settings }
}

// filterName is institution or account
// options are Questrade, TD, etc for institution and RRSP, TFSA, etc for account
export const createPortfolioFilters = (filterName, options) => {
  // Default each new option to true (visible)
  const newOptions = options.reduce((acc, filter) => ({ ...acc, [filter]: true }), {})
  return { type: types.CREATE_PORTFOLIO_FILTERS, payload: { filterName, options: newOptions } }
}

export const deletePortfolioFilters = (filterName, options) => {
  return { type: types.DELETE_PORTFOLIO_FILTERS, payload: { filterName, options } }
}

export const updatePortfolioFilterValue = (filterName, option, value) => {
  return async (dispatch) => {
    dispatch({ type: types.UPDATE_PORTFOLIO_FILTER_VALUE, payload: { filterName, option, value } })
    saveState()
  }
}

export const updatePortfolioFilters = () => {
  return (dispatch, getState) => {
    const filters = getState().settings.portfolioFilters
    _.each(filters, (options, filterName) => {
      const existingFilters = Object.keys(options || {})
      const newFilters = _(getState().transactions).map(filterName).uniq().value()

      const filtersToRemove = _.difference(existingFilters, newFilters)
      const filtersToAdd = _.difference(newFilters, existingFilters)

      if (!_.isEmpty(filtersToRemove)) {
        dispatch(deletePortfolioFilters(filterName, filtersToRemove))
      }

      if (!_.isEmpty(filtersToAdd)) {
        dispatch(createPortfolioFilters(filterName, filtersToAdd))
      }
    })
  }
}
