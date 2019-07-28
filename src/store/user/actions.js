/* eslint-disable import/no-cycle */
import { UserSession, Person } from 'blockstack'
import types from './types'
import store from '../index'
import * as storage from '../blockstackStorage'
import { showOverlay, hideOverlay, loadSettings } from '../settings/actions'
import { initialState as settingsInitialState } from '../settings/reducer'
import { loadAccounts } from '../accounts/actions'
import { initialState as accountsInitialState } from '../accounts/reducer'
import { loadTransactions } from '../transactions/actions'
import { initialState as transactionsInitialState } from '../transactions/reducer'
import { loadExchangeRates } from '../exchangeRates/actions'
import { initialState as exchangeRatesInitialState } from '../exchangeRates/reducer'
import { loadBudget } from '../budget/actions'
import { initialState as budgetInitialState } from '../budget/reducer'

export const saveLoginData = loginData => ({
  type: types.SAVE_LOGIN_DATA,
  payload: loginData
})

export const loadUserData = () => (dispatch, getState) => {
  const userSession = new UserSession()
  if (!getState().user.isLoading && userSession.isUserSignedIn()) {
    dispatch(showOverlay('Loading data from Blockstack...'))

    const { username, profile } = userSession.loadUserData()
    const person = new Person(profile)

    dispatch(saveLoginData({
      isLoginPending: false,
      isAuthenticatedWith: 'blockstack',
      username,
      name: person.name(),
      pictureUrl: person.avatarUrl()
    }))
    storage.loadState().then((state) => {
      dispatch(loadSettings({
        ...(state || {}).settings,
        overlayMessage: ('settings' in getState() ? getState().settings.overlayMessage : '')
      }))
      dispatch(loadAccounts((state || {}).accounts))
      dispatch(loadTransactions((state || {}).transactions))
      dispatch(loadExchangeRates((state || {}).exchangeRates))
      dispatch(loadBudget((state || {}).budget))
      dispatch(hideOverlay())
    }).catch((error) => {
      throw error
    })
  }
  return Promise.resolve()
}

export const loginAs = (loginType) => {
  if (loginType === 'blockstack') {
    // Open the blockstack browser for sign in
    const userSession = new UserSession()
    return userSession.redirectToSignIn(`${window.location.origin}/handle-login`)
  }

  return (dispatch) => {
    return dispatch(saveLoginData({
      isLoginPending: false,
      isAuthenticatedWith: 'guest',
      username: 'guest',
      name: 'Guest user',
      pictureUrl: null
    }))
  }
}

export const userLoginError = error => ({
  type: types.USER_LOGIN_ERROR,
  payload: error
})

// Handle sign in from Blockstack after redirect from Blockstack browser
export const handleBlockstackLogin = () => (dispatch) => {
  const userSession = new UserSession()
  return userSession.handlePendingSignIn()
    .then(() => dispatch(loadUserData()))
    .catch(error => dispatch(userLoginError(error)))
}

export const resetState = () => (dispatch, getState) => {
  const { settings } = getState()
  if (settings === undefined) {
    dispatch(loadSettings(settingsInitialState))
  } else {
    // Don't remove the existing currency and locale
    dispatch(loadSettings({
      ...settingsInitialState,
      currency: settings.currency,
      locale: settings.locale
    }))
  }
  dispatch(loadAccounts(accountsInitialState))
  dispatch(loadTransactions(transactionsInitialState))
  dispatch(loadExchangeRates(exchangeRatesInitialState))
  dispatch(loadBudget(budgetInitialState))
}

export const userLogout = () => async (dispatch) => {
  const userSession = new UserSession()
  await userSession.signUserOut()
  await dispatch(resetState())
  await dispatch({ type: types.USER_LOGOUT })
}

export const saveState = () => storage.saveState(store.getState())
