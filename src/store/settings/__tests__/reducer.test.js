import settingsReducer, { initialState } from '../reducer'
import types from '../types'

describe('settings reducer', () => {
  it('should return initial state', () => {
    expect(settingsReducer(undefined, {})).toEqual(initialState)
  })

  it('should handle LOAD_SETTINGS', () => {
    const type = types.LOAD_SETTINGS
    const payload = {
      portfolioFilters: {
        institution: 'Questrade',
        account: 'RRSP'
      }
    }
    expect(settingsReducer(undefined, { type, payload })).toEqual(payload)
  })

  it('should handle LOAD_SETTINGS with no existing transactions', () => {
    const type = types.LOAD_SETTINGS
    const payload = null
    expect(settingsReducer(undefined, { type, payload })).toEqual(initialState)
  })

  it('should handle CREATE_PORTFOLIO_FILTERS', () => {
    const type = types.CREATE_PORTFOLIO_FILTERS
    const payload = {
      filterName: 'institution',
      options: { Questrade: true }
    }

    expect(settingsReducer(undefined, { type, payload })).toEqual({
      portfolioFilters: {
        ...initialState.portfolioFilters,
        [payload.filterName]: payload.options
      }
    })
  })

  it('should handle CREATE_PORTFOLIO_FILTERS whith existing filter', () => {
    const type = types.CREATE_PORTFOLIO_FILTERS
    const state = {
      ...initialState,
      institution: { Questrade: true }
    }
    const payload = {
      filterName: 'institution',
      options: { TD: true, BMO: true }
    }

    expect(settingsReducer(state, { type, payload })).toEqual({
      ...state,
      portfolioFilters: {
        ...state.portfolioFilters,
        [payload.filterName]: {
          ...state.portfolioFilters[payload.filterName],
          ...payload.options
        }
      }
    })
  })

  it('should handle DELETE_PORTFOLIO_FILTERS', () => {
    const type = types.DELETE_PORTFOLIO_FILTERS
    const state = {
      portfolioFilters: {
        ...initialState.portfolioFilters,
        institution: { Questrade: true, TD: true, BMO: true }
      }
    }
    const payload = {
      filterName: 'institution',
      options: ['Questrade', 'BMO']
    }
    expect(settingsReducer(state, { type, payload })).toEqual({
      ...state,
      portfolioFilters: {
        ...state.portfolioFilters,
        [payload.filterName]: { TD: true }
      }
    })
  })


  it('should handle UPDATE_PORTFOLIO_FILTER_VALUE', () => {
    const type = types.UPDATE_PORTFOLIO_FILTER_VALUE
    const state = {
      portfolioFilters: {
        ...initialState.portfolioFilters,
        institution: { Questrade: true, TD: true }
      }
    }
    const payload = {
      filterName: 'institution',
      option: 'Questrade',
      value: false
    }
    expect(settingsReducer(state, { type, payload })).toEqual({
      ...state,
      portfolioFilters: {
        ...state.portfolioFilters,
        [payload.filterName]: { Questrade: false, TD: true }
      }
    })
  })
})
