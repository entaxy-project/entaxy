import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { devToolsEnhancer } from 'redux-devtools-extension'
import rootReducer from './reducers'
import App from './core/App/index'

const store = createStore(rootReducer, devToolsEnhancer())

export default (target = document) => {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    target.getElementById('root')
  )
}
