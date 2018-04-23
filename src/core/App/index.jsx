import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { createMuiTheme, MuiThemeProvider } from 'material-ui/styles'
import CssBaseline from 'material-ui/CssBaseline'
import blueGrey from 'material-ui/colors/blueGrey'
import teal from 'material-ui/colors/teal'
import { isUserSignedIn, loadUserData, Person } from 'blockstack'
import Header from '../../common/Header/index'
import Routes from '../../routes'
import { authenticationLogin } from './actions'

const theme = createMuiTheme({
  palette: {
    primary: { main: blueGrey[800] },
    secondary: { main: teal[500] }
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
          <Header />
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
