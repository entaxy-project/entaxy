import React from 'react'
import { createMuiTheme, MuiThemeProvider } from 'material-ui/styles'
import CssBaseline from 'material-ui/CssBaseline'
import blueGrey from 'material-ui/colors/blueGrey'
import Routes from '../../routes'
import '../../styles/globals.css'

const theme = createMuiTheme({
  palette: {
    primary: { main: blueGrey[800] },
    secondary: { main: '#1B9CC4' }
  }
})

const App = () => (
  <CssBaseline>
    <MuiThemeProvider theme={theme}>
      <Routes />
    </MuiThemeProvider>
  </CssBaseline>
)

export default App
