import types from './types'

const authenticationLogin = profile => ({
  type: types.AUTHENTICATION_LOGIN,
  profile
})

export { authenticationLogin }

export default {
  authenticationLogin
}
