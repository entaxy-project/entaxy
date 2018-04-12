import React from 'react'
import { createMuiTheme, MuiThemeProvider } from 'material-ui/styles'
import Reboot from 'material-ui/Reboot'
import blueGrey from 'material-ui/colors/blueGrey'
import teal from 'material-ui/colors/teal'
import Header from '../../common/Header/index'
import Routes from '../../routes'
import 'typeface-roboto'

// import PropTypes from 'prop-types';
const theme = createMuiTheme({
  palette: {
    primary: { main: blueGrey[800] },
    secondary: { main: teal[500] }
  }
})

const App = () => {
  // const { classes } = props
  return (
    <Reboot>
      <MuiThemeProvider theme={theme}>
        <Header />
        <Routes />
      </MuiThemeProvider>
    </Reboot>
  )
}

// App.propTypes = {
//   classes: PropTypes.object.isRequired,
// };

export default App
