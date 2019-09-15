import types from './types'

export const updateLoginData = (loginData) => ({
  type: types.UPDATE_LOGIN_DATA,
  payload: loginData
})

export const userLoginError = (error) => ({
  type: types.USER_LOGIN_ERROR,
  payload: error
})

export const showOverlay = (message) => ({
  type: types.SHOW_OVERLAY,
  payload: message
})

export const hideOverlay = () => ({ type: types.HIDE_OVERLAY })
