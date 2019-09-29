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

  it('should handle UPDATE_SETTINGS', () => {
    const type = types.UPDATE_SETTINGS
    const payload = { locale: 'en-CA', currency: 'CAD' }
    expect(settingsReducer(undefined, { type, payload })).toEqual({ ...payload })
  })
})
