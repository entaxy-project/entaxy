/* eslint-disable import/no-cycle */
import { snakeCase } from 'lodash'
import * as blockstackStorage from './blockstackStorage'
import * as localStorage from './localStorage'
import { showOverlay, hideOverlay } from '../settings/actions'
import { initialState as settingsInitialState } from '../settings/reducer'
import { initialState as accountsInitialState } from '../accounts/reducer'
import { initialState as transactionsInitialState } from '../transactions/reducer'
import { initialState as exchangeRatesInitialState } from '../exchangeRates/reducer'
import { initialState as budgetInitialState } from '../budget/reducer'

export const loadItem = (itemName, newState) => (dispatch, getState) => {
  let payload = newState
  if (itemName === 'settings') {
    const { settings } = getState()
    if (settings !== null && settings !== undefined) {
      payload = { ...newState, overlayMessage: settings.overlayMessage }
    }
  }
  dispatch({
    type: `LOAD_${snakeCase(itemName).toUpperCase()}`,
    payload
  })
}

export const loadAllItems = (newState) => (dispatch) => {
  [
    'settings',
    'accounts',
    'transactions',
    'exchangeRates',
    'budget'
  ].map((itemName) => dispatch(loadItem(itemName, newState[itemName] || {})))
}


export const loadState = () => async (dispatch, getState) => {
  if (getState().user === undefined) return {}
  let newState
  switch (getState().user.isAuthenticatedWith) {
    case 'guest':
      dispatch(showOverlay('Loading data from localStorage...'))
      newState = await localStorage.loadState()
      break
    case 'blockstack':
      dispatch(showOverlay('Loading data from Blockstack...'))
      newState = await blockstackStorage.loadState()
      break
    // no default
  }
  if (newState === undefined) newState = { settings: settingsInitialState }
  dispatch(loadAllItems({
    ...newState,
    settings: {
      ...newState.settings,
      snackbarMessage: null
    }
  }))
  return dispatch(hideOverlay())
}

export const resetState = () => (dispatch, getState) => {
  const { settings } = getState()

  // Preserve the existing currency and locale
  dispatch(loadAllItems({
    settings: {
      ...settingsInitialState,
      currency: settings.currency,
      locale: settings.locale
    },
    accounts: accountsInitialState,
    transactions: transactionsInitialState,
    exchangeRates: exchangeRatesInitialState,
    budget: budgetInitialState
  }))
}

export const saveState = () => (_, getState) => {
  let { user } = getState()
  if (user === undefined) user = {}
  switch (user.isAuthenticatedWith) {
    case 'guest':
      return localStorage.saveState(getState())
    case 'blockstack':
      return blockstackStorage.saveState(getState())
    default:
      return undefined
  }
}
