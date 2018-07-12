import types from './types'

export const initialState = {
  isAuthenticated: false,
  isLoginPending: false,
  username: null,
  name: null,
  pictureUrl: null,
  error: null
}

export default (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_USER_DATA:
      return { ...state, ...action.payload }
    case types.USER_LOGIN:
      return { ...state, isLoginPending: true }
    case types.USER_LOGIN_SUCCESS:
      return { ...state, isAuthenticated: true }
    case types.USER_LOGOUT:
      return { ...initialState }
    case types.USER_HANDLE_LOGIN:
      return { ...state, isLoginPending: false }
    case types.USER_LOGIN_ERROR:
      return { ...state, error: action.payload }
    case types.USER_UPDATE_COUNTRY:
      return { ...state, country: action.country }
    default:
      return state
  }
}
