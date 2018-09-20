import types from './types'

export const initialState = {
  isLoading: false,
  isAuthenticated: false,
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
      return { ...state, isLoginPending: true }
    case types.USER_LOGIN_SUCCESS:
      return { ...state, isLoginPending: false, isAuthenticated: true }
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
