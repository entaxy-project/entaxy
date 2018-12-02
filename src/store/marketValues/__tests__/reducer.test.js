import marketValuesReducer, { initialState } from '../reducer'
import types from '../types'

describe('marketValue reducer', () => {
  it('should return initial state', () => {
    expect(marketValuesReducer(undefined, {})).toEqual(initialState)
  })

  it('should handle LOAD_MARKET_VALUES', () => {
    const type = types.LOAD_MARKET_VALUES
    const payload = {
      VET: {
        marketValue: '1',
        updatedOn: '2018-11-30'
      }
    }
    expect(marketValuesReducer(undefined, { type, payload })).toEqual(payload)
  })

  it('should handle LOAD_MARKET_VALUES with no existing data', () => {
    const type = types.LOAD_MARKET_VALUES
    const payload = null
    expect(marketValuesReducer(undefined, { type, payload })).toEqual(initialState)
  })

  it('should handle CREATE_MARKET_VALUE', () => {
    const type = types.CREATE_MARKET_VALUE
    const payload = {
      ticker: 'VET',
      marketValue: '1',
      updatedOn: '2018-11-30'
    }

    expect(marketValuesReducer(undefined, { type, payload })).toEqual({
      VET: {
        marketValue: '1',
        updatedOn: '2018-11-30'
      }
    })
  })

  it('should handle UPDATE_MARKET_VALUE', () => {
    const type = types.UPDATE_MARKET_VALUE
    const state = {
      VET: {
        marketValue: '1',
        updatedOn: '2018-11-30'
      }
    }
    const payload = {
      ticker: 'VET',
      marketValue: '2',
      updatedOn: '2018-11-30'
    }

    expect(marketValuesReducer(state, { type, payload })).toEqual({
      VET: {
        marketValue: '2',
        updatedOn: '2018-11-30'
      }
    })
  })

  it('should handle UPDATE_MARKET_VALUE for new value', () => {
    const type = types.UPDATE_MARKET_VALUE
    const payload = {
      ticker: 'VET',
      marketValue: '2',
      updatedOn: '2018-11-30'
    }

    expect(marketValuesReducer(undefined, { type, payload })).toEqual({
      VET: {
        marketValue: '2',
        updatedOn: '2018-11-30'
      }
    })
  })

  it('should handle DELETE_MARKET_VALUES for new value', () => {
    const type = types.DELETE_MARKET_VALUES
    const state = {
      VET: {
        marketValue: '1',
        updatedOn: '2018-11-30'
      },
      VAB: {
        marketValue: '2',
        updatedOn: '2018-11-30'
      }
    }

    expect(marketValuesReducer(state, { type, payload: ['VET'] })).toEqual({
      VAB: {
        marketValue: '2',
        updatedOn: '2018-11-30'
      }
    })
  })
})
