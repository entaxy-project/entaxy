import userReducer, { initialState } from '../reducer'
import types from '../types'

describe('user reducer', () => {
  it('should return initial state', () => {
    expect(userReducer(undefined, {})).toEqual(initialState)
  })

  it('should handle FETCH_USER_DATA with authenticated user', () => {
    const type = types.FETCH_USER_DATA
    const payload = {
      isAuthenticated: true,
      username: 'test-username',
      name: 'Test Name',
      pictureUrl: 'Test URL'
    }
    expect(userReducer(undefined, { type, payload })).toEqual({ ...initialState, ...payload })
  })

  it('should handle FETCH_USER_DATA with pending user', () => {
    const type = types.FETCH_USER_DATA
    const payload = { isLoginPending: true }
    expect(userReducer(undefined, { type, payload })).toEqual({ ...initialState, ...payload })
  })

  it('should handle USER_LOGIN', () => {
    const type = types.USER_LOGIN
    const payload = { isLoginPending: true }
    expect(userReducer(undefined, { type, payload })).toEqual({ ...initialState, ...payload })
  })

  it('should handle USER_LOGIN_SUCCESS', () => {
    const type = types.USER_LOGIN_SUCCESS
    const payload = { isAuthenticated: true }
    expect(userReducer(undefined, { type, payload })).toEqual({ ...initialState, ...payload })
  })

  it('should handle USER_LOGOUT', () => {
    const type = types.USER_LOGOUT
    const payload = { isAuthenticated: true }
    expect(userReducer(undefined, { type, payload })).toEqual({ ...initialState })
  })

  it('should handle USER_HANDLE_LOGIN', () => {
    const type = types.USER_HANDLE_LOGIN
    const payload = { isLoginPending: false }
    expect(userReducer(undefined, { type, payload })).toEqual({ ...initialState, ...payload })
  })

  it('should handle USER_LOGIN_ERROR', () => {
    const type = types.USER_LOGIN_ERROR
    const payload = { status: 404, message: 'Some error' }
    expect(userReducer(undefined, { type, payload })).toEqual({ ...initialState, error: payload })
  })
})
