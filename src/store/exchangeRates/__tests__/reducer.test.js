import exchangeRatesReducer, { initialState } from '../reducer'
import types from '../types'

describe('exchangeRate reducer', () => {
  it('should return initial state', () => {
    expect(exchangeRatesReducer(undefined, {})).toEqual(initialState)
  })

  it('should handle LOAD_EXCHANGE_RATES', () => {
    const type = types.LOAD_EXCHANGE_RATES
    const payload = {
      VET: {
        exchangeRate: '1',
        updatedOn: '2018-11-30'
      }
    }
    expect(exchangeRatesReducer(undefined, { type, payload })).toEqual(payload)
  })

  it('should handle LOAD_EXCHANGE_RATES with no existing data', () => {
    const type = types.LOAD_EXCHANGE_RATES
    const payload = null
    expect(exchangeRatesReducer(undefined, { type, payload })).toEqual(initialState)
  })

  it('should handle CREATE_EXCHANGE_RATE', () => {
    const type = types.CREATE_EXCHANGE_RATE
    const payload = {
      currency: 'VET',
      exchangeRate: '1',
      updatedOn: '2018-11-30'
    }

    expect(exchangeRatesReducer(undefined, { type, payload })).toEqual({
      VET: {
        exchangeRate: '1',
        updatedOn: '2018-11-30'
      }
    })
  })

  it('should handle UPDATE_EXCHANGE_RATE', () => {
    const type = types.UPDATE_EXCHANGE_RATE
    const state = {
      VET: {
        exchangeRate: '1',
        updatedOn: '2018-11-30'
      }
    }
    const payload = {
      currency: 'VET',
      exchangeRate: '2',
      updatedOn: '2018-11-30'
    }

    expect(exchangeRatesReducer(state, { type, payload })).toEqual({
      VET: {
        exchangeRate: '2',
        updatedOn: '2018-11-30'
      }
    })
  })

  it('should handle UPDATE_EXCHANGE_RATE for new value', () => {
    const type = types.UPDATE_EXCHANGE_RATE
    const payload = {
      currency: 'VET',
      exchangeRate: '2',
      updatedOn: '2018-11-30'
    }

    expect(exchangeRatesReducer(undefined, { type, payload })).toEqual({
      VET: {
        exchangeRate: '2',
        updatedOn: '2018-11-30'
      }
    })
  })

  it('should handle DELETE_EXCHANGE_RATES for new value', () => {
    const type = types.DELETE_EXCHANGE_RATES
    const state = {
      VET: {
        exchangeRate: '1',
        updatedOn: '2018-11-30'
      },
      VAB: {
        exchangeRate: '2',
        updatedOn: '2018-11-30'
      }
    }

    expect(exchangeRatesReducer(state, { type, payload: ['VET'] })).toEqual({
      VAB: {
        exchangeRate: '2',
        updatedOn: '2018-11-30'
      }
    })
  })
})
