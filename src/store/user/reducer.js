import types from './types'

export const initialState = {
  isLoading: false,
  isAuthenticatedWith: null,
  isLoginPending: false,
  username: null,
  name: null,
  pictureUrl: null,
  error: null
}

export default (state = initialState, action) => {
  switch (action.type) {
    case types.LOAD_USER_DATA:
      return { ...state, isLoading: action.payload }
    case types.LOAD_USER_DATA_SUCCESS:
      return { ...state, ...action.payload }
    case types.USER_LOGIN:
      return {
        guest: {
          ...state,
          isAuthenticatedWith: 'guest',
          username: null,
          name: 'Guest user',
          pictureUrl: null
        },
        blockstack: { ...state, isLoginPending: true }
      }[action.payload]
    case types.USER_LOGIN_SUCCESS:
      return { ...state, isLoginPending: false, isAuthenticatedWith: 'blockstack' }
    case types.USER_LOGOUT:
      return initialState
    case types.USER_LOGIN_ERROR:
      return { ...state, error: action.payload }
    case types.USER_UPDATE_COUNTRY:
      return { ...state, country: action.country }
    default:
      return state
  }
}
