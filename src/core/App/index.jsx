import React from 'react'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import blueGrey from '@material-ui/core/colors/blueGrey'
import Routes from '../../routes'
import '../../styles/globals.css'

const theme = createMuiTheme({
  palette: {
    primary: { main: blueGrey[800] },
    secondary: { main: '#1B9CC4' },
    info: {
      text: '#00acc1',
      background: '#00acc11a'
    },
    danger: {
      text: '#721c24',
      background: '#f8d7da66'
    }

  },
  typography: {
    useNextVariants: true
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
