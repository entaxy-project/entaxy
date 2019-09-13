import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { UserSession } from 'blockstack'
import { store, loginAs } from './store'
import Routes from './routes'
import ThemeProvider from './core/ThemeProvider'

// Check for blockstack login
const userSession = new UserSession()
if (userSession.isUserSignedIn()) {
  loginAs('blockstack')
}

export default (target = document) => {
  ReactDOM.render(
    <Provider store={store}>
      <ThemeProvider>
        <Routes />
      </ThemeProvider>
    </Provider>,
    target.getElementById('root')
  )
}
