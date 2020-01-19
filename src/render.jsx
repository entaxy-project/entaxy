import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { UserSession } from 'blockstack'
import { FlagsProvider } from 'flagged'
import { store, loginAs } from './store'
import Routes from './routes'
import ThemeProvider from './core/ThemeProvider'
import features from './features'

// Check for blockstack login
const userSession = new UserSession()
if (userSession.isUserSignedIn()) {
  loginAs('blockstack')
}

export default (target = document) => {
  ReactDOM.render(
    <FlagsProvider features={features}>
      <Provider store={store}>
        <ThemeProvider>
          <BrowserRouter basename={process.env.PUBLIC_URL}>
            <Routes />
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    </FlagsProvider>,
    target.getElementById('root')
  )
}
