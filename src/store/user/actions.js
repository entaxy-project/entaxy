/* eslint-disable import/no-cycle */
import { UserSession, Person } from 'blockstack'
import types from './types'
import * as storage from '../storage'

export const saveLoginData = (loginData) => ({
  type: types.SAVE_LOGIN_DATA,
  payload: loginData
})

export const loadUserDataFromBlockstack = () => (dispatch, getState) => {
  const userSession = new UserSession()
  if (!getState().user.isLoading && userSession.isUserSignedIn()) {
    const { username, profile } = userSession.loadUserData()
    const person = new Person(profile)
    dispatch(saveLoginData({
      isLoginPending: false,
      isAuthenticatedWith: 'blockstack',
      username,
      name: person.name(),
      pictureUrl: person.avatarUrl()
    }))
    dispatch(storage.loadState())
  }
  return Promise.resolve()
}

export const loginAs = (loginType) => {
  if (loginType === 'blockstack') {
    // Open the blockstack browser for sign in
    const userSession = new UserSession()
    userSession.redirectToSignIn(`${window.location.origin}/handle-login`)
    return { type: '' }
  }

  return (dispatch) => {
    dispatch(saveLoginData({
      isLoginPending: false,
      isAuthenticatedWith: 'guest',
      username: 'guest',
      name: 'Guest user',
      pictureUrl: null
    }))
    dispatch(storage.loadState())
  }
}

export const userLoginError = (error) => ({
  type: types.USER_LOGIN_ERROR,
  payload: error
})

// Handle sign in from Blockstack after redirect from Blockstack browser
export const handleBlockstackLogin = () => (dispatch) => {
  const userSession = new UserSession()
  return userSession.handlePendingSignIn()
    .then(() => dispatch(loadUserDataFromBlockstack()))
    .catch((error) => dispatch(userLoginError(error)))
}

export const userLogout = () => async (dispatch) => {
  const userSession = new UserSession()
  await userSession.signUserOut()
  await dispatch(storage.resetState())
  await dispatch({ type: types.USER_LOGOUT })
}
