import types from './types'

export const updateLoginData = (loginData) => ({
  type: types.UPDATE_LOGIN_DATA,
  payload: loginData
})

export const userLoginError = (error) => ({
  type: types.USER_LOGIN_ERROR,
  payload: error
})

// Overlay
export const showOverlay = (message) => ({
  type: types.SHOW_OVERLAY,
  payload: message
})

export const hideOverlay = () => ({ type: types.HIDE_OVERLAY })

// Snackbar
export const showSnackbar = (message) => ({
  type: types.SHOW_SNACKBAR, payload: message
})

export const hideSnackbar = () => ({
  type: types.HIDE_SNACKBAR
})
