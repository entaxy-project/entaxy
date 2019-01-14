import userReducer, { initialState } from '../reducer'
import types from '../types'

describe('user reducer', () => {
  it('should return initial state', () => {
    expect(userReducer(undefined, {})).toEqual(initialState)
  })

  it('should handle SAVE_LOGIN_DATA with authenticated user', () => {
    const type = types.SAVE_LOGIN_DATA
    const payload = {
      isLoginPending: false,
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
})
