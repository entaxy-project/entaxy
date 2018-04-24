import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { createMuiTheme, MuiThemeProvider } from 'material-ui/styles'
import CssBaseline from 'material-ui/CssBaseline'
import blueGrey from 'material-ui/colors/blueGrey'
import { isUserSignedIn, loadUserData, Person } from 'blockstack'
import Routes from '../../routes'
import { authenticationLogin } from './actions'
import '../../styles/globals.css'

const theme = createMuiTheme({
  palette: {
    primary: { main: blueGrey[800] },
    secondary: { main: '#1B9CC4' }
  }
})

class App extends React.Component {
  constructor(props) {
    super(props)
    const { dispatch } = this.props
    if (isUserSignedIn()) {
      const userData = loadUserData()
      const { profile } = userData
      const person = new Person(profile)
      dispatch(authenticationLogin(person))
    }
  }

  render() {
    return (
      <CssBaseline>
        <MuiThemeProvider theme={theme}>
          <Routes />
        </MuiThemeProvider>
      </CssBaseline>
    )
  }
}

App.propTypes = {
  dispatch: PropTypes.func.isRequired
}

export default connect()(App)
