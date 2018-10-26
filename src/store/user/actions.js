/* eslint-disable no-console */
import * as blockstack from 'blockstack'
import types from './types'
import store from '../index'
import * as storage from '../blockstackStorage'
import { loadSettings } from '../settings/actions'
import { initialState as settingsInitialState } from '../settings/reducer'
import { loadTransactions } from '../transactions/actions'
import { initialState as marketValuesInitialState } from '../marketValues/reducer'
import { loadMarketValues } from '../marketValues/actions'
import { initialState as transactionsInitialState } from '../transactions/reducer'


export const dataIsLoading = (bool) => {
  return {
    type: types.LOAD_USER_DATA,
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
      return storage.loadState().then((state) => {
        dispatch(loadSettings((state || {}).settings))
        dispatch(loadTransactions((state || {}).transactions))
        dispatch(loadMarketValues((state || {}).marketValues))
        dispatch(dataIsLoading(false))
      }).catch((error) => {
        throw error
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
      .then(() => dispatch(loadUserData()))
      .catch(error => dispatch(userLoginError(error)))
  }
}

export const userLogout = () => {
  blockstack.signUserOut()
  return (dispatch) => {
    dispatch(loadSettings(settingsInitialState))
    dispatch(loadTransactions(transactionsInitialState))
    dispatch(loadMarketValues(marketValuesInitialState))
    dispatch({ type: types.USER_LOGOUT })
  }
}

export const saveState = () => {
  storage.saveState(store.getState())
}
