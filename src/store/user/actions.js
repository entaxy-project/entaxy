import * as blockstack from 'blockstack'
import types from './types'

export const fetchUserData = () => {
  if (blockstack.isUserSignedIn()) {
    const { username, profile } = blockstack.loadUserData()
    const person = new blockstack.Person(profile)

    return {
      type: types.FETCH_USER_DATA,
      payload: {
        isAuthenticated: true,
        username,
        name: person.name(),
        pictureUrl: person.avatarUrl()
      }
    }
  } else if (blockstack.isSignInPending()) {
    return {
      type: types.FETCH_USER_DATA,
      payload: {
        isLoginPending: true
      }
    }
  }

  return { type: types.FETCH_USER_DATA }
}

export const userLogin = () => {
  // Open the blockstack browser for sign in
  // After choosing an Id to sign in with, redirect back to the login page
  blockstack.redirectToSignIn(`${window.location.origin}/handle-login`)
  return { type: types.USER_LOGIN }
}

export const userLogout = () => {
  blockstack.signUserOut()
  return { type: types.USER_LOGOUT }
}

export const userLoginError = (error) => {
  return { type: types.USER_LOGIN_ERROR, payload: error }
}

export const handleBlockstackLogin = () => {
  return (dispatch) => {
    dispatch({ type: types.USER_HANDLE_LOGIN })

    // Handle sign in from Blockstack after redirect from Blockstack browser
    // Once sign in completes (promise is fulfilled), redirect to an authenticated only route
    return blockstack.handlePendingSignIn()
      .then(
        () => {
          window.location.replace(`${window.location.origin}/`)
          dispatch({ type: types.USER_LOGIN_SUCCESS })
          dispatch(fetchUserData())
        },

        error => dispatch(userLoginError(error))
      )
  }
}
