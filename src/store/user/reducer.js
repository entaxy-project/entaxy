import types from './types'

export const initialState = {
  overlayMessage: null,
  snackbarMessage: null,
  isAuthenticatedWith: null,
  username: null,
  name: null,
  pictureUrl: null,
  error: null
}

export default (state = initialState, { payload, type }) => {
  switch (type) {
    case types.UPDATE_LOGIN_DATA:
      return { ...state, ...payload }
    case types.USER_LOGOUT:
      return initialState
    case types.USER_LOGIN_ERROR:
      return { ...state, error: payload }
    case types.SHOW_OVERLAY:
      return { ...state, overlayMessage: payload }
    case types.HIDE_OVERLAY:
      return { ...state, overlayMessage: null }
    case types.SHOW_SNACKBAR:
      return { ...state, snackbarMessage: payload }
    case types.HIDE_SNACKBAR:
      return { ...state, snackbarMessage: null }
    default:
      return state
  }
}
