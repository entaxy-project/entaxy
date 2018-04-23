import types from './types'

const app = (state = {}, action) => {
  switch (action.type) {
    case types.AUTHENTICATION_LOGIN:
      return {
        ...state,
        loggedIn: true,
        profile: action.profile
      }

    default:
      return state
  }
}

export default app
