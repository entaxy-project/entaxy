import userReducer, { initialState } from '../reducer'
import types from '../types'

describe('user reducer', () => {
  it('should return initial state', () => {
    expect(userReducer(undefined, {})).toEqual(initialState)
  })

  it('should handle UPDATE_LOGIN_DATA with authenticated user', () => {
    const type = types.UPDATE_LOGIN_DATA
    const payload = {
      isAuthenticatedWith: 'blockstack',
      username: 'test-username',
      name: 'Test Name',
      pictureUrl: 'Test URL'
    }
    expect(userReducer(undefined, { type, payload })).toEqual({ ...initialState, ...payload })
  })

  it('should handle USER_LOGOUT', () => {
    const type = types.USER_LOGOUT
    const payload = { isAuthenticatedWith: 'blockstack' }
    expect(userReducer(undefined, { type, payload })).toEqual({ ...initialState })
  })

  it('should handle USER_LOGIN_ERROR', () => {
    const type = types.USER_LOGIN_ERROR
    const payload = { status: 404, message: 'Some error' }
    expect(userReducer(undefined, { type, payload })).toEqual({ ...initialState, error: payload })
  })

  it('should handle SHOW_OVERLAY', () => {
    const type = types.SHOW_OVERLAY
    const payload = 'Loading ...'
    expect(userReducer(undefined, { type, payload })).toEqual({
      ...initialState,
      overlayMessage: payload
    })
  })

  it('should handle HIDE_OVERLAY', () => {
    const type = types.HIDE_OVERLAY
    expect(userReducer(undefined, { type })).toEqual({
      ...initialState,
      overlayMessage: null
    })
  })
  it('should handle SHOW_SNACKBAR', () => {
    const type = types.SHOW_SNACKBAR
    const payload = 'Account updated'
    expect(userReducer(undefined, { type, payload })).toEqual({
      ...initialState,
      snackbarMessage: payload
    })
  })

  it('should handle HIDE_SNACKBAR', () => {
    const type = types.HIDE_SNACKBAR
    expect(userReducer(undefined, { type })).toEqual({
      ...initialState,
      snackbarMessage: null
    })
  })
})
