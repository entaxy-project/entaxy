import * as blockstack from 'blockstack'
import types from './types'
import { loadState } from '../blockstackStorage'
import { loadTransactions } from '../transactions/actions'

export const dataIsLoading = (bool) => {
  return {
    type: types.DATA_IS_LOADING,
    payload: bool
  }
}

export const loadUserDataSuccess = userData => (
  {
    type: types.LOAD_USER_DATA_SUCCESS,
    payload: userData
  }
)

export const loadUserData = () => {
  return (dispatch) => {
    if (blockstack.isUserSignedIn()) {
      dispatch(dataIsLoading(true))

      const { username, profile } = blockstack.loadUserData()
      const person = new blockstack.Person(profile)

      dispatch(loadUserDataSuccess({
        isAuthenticated: true,
        username,
        name: person.name(),
        pictureUrl: person.avatarUrl()
      }))

      loadState().then((state) => {
        dispatch(loadTransactions(state.transactions))
        dispatch(dataIsLoading(false))
      })
    }
    return null
  }
}

export const userLogin = () => {
  // Open the blockstack browser for sign in
  blockstack.redirectToSignIn(`${window.location.origin}/handle-login`)
  return { type: types.USER_LOGIN }
}

export const userLoginError = (error) => {
  return { type: types.USER_LOGIN_ERROR, payload: error }
}

export const handleBlockstackLogin = () => {
  return (dispatch) => {
    // Handle sign in from Blockstack after redirect from Blockstack browser
    return blockstack.handlePendingSignIn()
      .then(
        () => {
          dispatch(loadUserData())
        },
        error => dispatch(userLoginError(error))
      )
  }
}

export const userLogout = () => {
  blockstack.signUserOut()
  return { type: types.USER_LOGOUT }
}
