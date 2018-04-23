import app from './../reducers'
import types from './../types'

describe('app reducer', () => {
  it('should handle initial state', () => {
    expect(app(undefined, {})).toEqual({})
  })

  it('should handle AUTHENTICATION_LOGIN', () => {
    expect(app(undefined, {
      type: types.AUTHENTICATION_LOGIN,
      profile: { foo: true, bar: 1 }
    })).toEqual({
      loggedIn: true,
      profile: { bar: 1, foo: true }
    })
  })
})
