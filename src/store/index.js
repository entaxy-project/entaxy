import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunkMiddleware from 'redux-thunk'
import rootReducer from './rootReducer'

const middlewares = [thunkMiddleware]

if (process.env.NODE_ENV === 'development') {
  const { logger } = require('redux-logger')
  middlewares.push(logger)
}

const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(...middlewares))
)

if (module.hot) {
  module.hot.accept(rootReducer, () => {
    store.replaceReducer(rootReducer)
  })
}

export default store
