import * as actions from './../actions'
import types from './../types'

describe('app actions', () => {
  it('authenticationLogin should set the profile', () => {
    expect(actions.authenticationLogin({ foo: true, bar: 1 })).toEqual({
      type: types.AUTHENTICATION_LOGIN,
      profile: { foo: true, bar: 1 }
    })
  })
})
