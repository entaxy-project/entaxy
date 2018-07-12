/* eslint-disable no-console */
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import throttle from 'lodash/throttle'
import thunkMiddleware from 'redux-thunk'
import rootReducer from './rootReducer'
import { saveState } from './blockstackStorage'

const middlewares = [thunkMiddleware]

if (process.env.NODE_ENV === 'development') {
  const { logger } = require('redux-logger')
  middlewares.push(logger)
}

const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(...middlewares))
)

store.subscribe(throttle(() => {
  saveState(store.getState())
}, 1000))

if (module.hot) {
  module.hot.accept(rootReducer, () => {
    store.replaceReducer(rootReducer)
  })
}

export default store
