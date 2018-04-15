import React from 'react'
import { createMuiTheme, MuiThemeProvider } from 'material-ui/styles'
import Reboot from 'material-ui/Reboot'
import blueGrey from 'material-ui/colors/blueGrey'
import teal from 'material-ui/colors/teal'
import 'typeface-roboto'
import Header from '../../common/Header/index'
import Routes from '../../routes'

const theme = createMuiTheme({
  palette: {
    primary: { main: blueGrey[800] },
    secondary: { main: teal[500] }
  }
})

const App = () => (
  <Reboot>
    <MuiThemeProvider theme={theme}>
      <Header />
      <Routes />
    </MuiThemeProvider>
  </Reboot>
)

export default App
