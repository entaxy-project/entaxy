import React from 'react'
import { createMuiTheme, MuiThemeProvider } from 'material-ui/styles'
import CssBaseline from 'material-ui/CssBaseline'
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
  <CssBaseline>
    <MuiThemeProvider theme={theme}>
      <Header />
      <Routes />
    </MuiThemeProvider>
  </CssBaseline>
)

export default App
