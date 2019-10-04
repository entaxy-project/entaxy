import { snakeCase } from 'lodash'
import { logger } from 'redux-logger'
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunkMiddleware from 'redux-thunk'
import { createMigrate, persistReducer, persistStore } from 'redux-persist'
import localforage from 'localforage'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import { AppConfig, UserSession, Person } from 'blockstack'
import blockstackStorage from './blockstackStorage'
import rootReducer from './rootReducer'
import migrations from './migrations'
import { initialState as settingsInitialState } from './settings/reducer'
import { initialState as accountsInitialState } from './accounts/reducer'
import { initialState as transactionsInitialState } from './transactions/reducer'
import { initialState as exchangeRatesInitialState } from './exchangeRates/reducer'
import { initialState as budgetInitialState } from './budget/reducer'
import { updateLoginData } from './user/actions'
import types from './user/types'
import avatarImg from '../common/LoginButton/avatar.png'


// Set middlewares
const middlewares = [thunkMiddleware]
if (process.env.NODE_ENV === 'development') {
  middlewares.push(logger)
}

export const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(...middlewares))
)

if (module.hot) {
  module.hot.accept(rootReducer, () => {
    store.replaceReducer(rootReducer)
  })
}

// eslint-disable-next-line import/no-mutable-exports
export let persistor = null

export const resetState = () => (dispatch, getState) => {
  const { settings } = getState()

  const newState = {
    settings: { // Preserve the existing currency and locale
      ...settingsInitialState,
      currency: settings.currency,
      locale: settings.locale
    },
    accounts: accountsInitialState,
    transactions: transactionsInitialState,
    exchangeRates: exchangeRatesInitialState,
    budget: budgetInitialState
  }

  Object.keys(newState).map((itemName) => dispatch({
    type: `LOAD_${snakeCase(itemName).toUpperCase()}`,
    payload: newState[itemName]
  }))
}

const setPersistor = ({ storageType }) => {
  const persistConfig = {
    key: 'entaxy',
    blacklist: ['user'],
    version: Object.keys(migrations).length - 1,
    migrate: createMigrate(migrations),
    stateReconciler: autoMergeLevel2
  }

  switch (storageType) {
    case 'local':
      persistConfig.storage = localforage
      break
    case 'blockstack':
      persistConfig.storage = blockstackStorage()
      break
    // no default
  }

  if (persistConfig.storage === undefined) {
    persistor.pause()
    persistor = null

    // Note: forcing reload to prevent the persistor from
    // re-dispatching all previously performed actions
    // could not find a solution for this so I'm just forcing a reload
    if (process.env.NODE_ENV === 'test') {
      store.replaceReducer(rootReducer)
    }
    // window.location.reload()
  } else {
    store.replaceReducer(persistReducer(persistConfig, rootReducer))
    persistor = persistStore(store)
  }
}

export const loginAs = (loginType) => {
  const appConfig = new AppConfig()
  const userSession = new UserSession({ appConfig })
  if (loginType === 'blockstack') {
    if (userSession.isUserSignedIn()) {
      const { username, profile } = userSession.loadUserData()
      const person = new Person(profile)
      setPersistor({ storageType: 'blockstack' })
      store.dispatch(updateLoginData({
        overlayMessage: 'Loading data from Blockstack ...',
        isAuthenticatedWith: 'blockstack',
        username,
        name: person.name() || username.split('.')[0],
        pictureUrl: person.avatarUrl() || avatarImg
      }))
    } else if (!userSession.isSignInPending()) {
      // Open the blockstack browser for sign in
      userSession.redirectToSignIn(`${window.location.origin}/handle-login`)
    }
  } else {
    store.dispatch(updateLoginData({
      overlayMessage: 'Loading data from local storage ...',
      isAuthenticatedWith: 'guest',
      username: 'guest',
      name: 'Guest user',
      pictureUrl: avatarImg
    }))
    setPersistor({ storageType: 'local' })
  }
}

export const userLogout = () => {
  const appConfig = new AppConfig()
  const userSession = new UserSession({ appConfig })
  const { user } = store.getState()
  if (user.isAuthenticatedWith === 'blockstack') {
    userSession.signUserOut()
  }
  store.dispatch({ type: types.USER_LOGOUT })
  setPersistor({ storageType: null })
  store.dispatch(resetState())
}
