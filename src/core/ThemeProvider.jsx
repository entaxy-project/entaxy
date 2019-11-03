import React from 'react'
import PropTypes from 'prop-types'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import blueGrey from '@material-ui/core/colors/blueGrey'
import '../styles/globals.css'

const theme = createMuiTheme({
  palette: {
    primary: { main: blueGrey[800] },
    secondary: { main: '#1B9CC4' },
    success: {
      text: '#155724',
      background: '#d4edda',
      icon: '#28a745'
    },
    info: {
      text: '#00acc1',
      background: 'rgb(227, 243, 247)',
      icon: '#17a2b8'
    },
    danger: {
      text: '#721c24',
      background: '#f8d7da66',
      icon: '#dc3545'
    },
    warning: {
      text: '#856404',
      background: '#fff3cd',
      icon: '#ffc107'
    }
  }
})

const ThemeProvider = ({ children }) => (
  <CssBaseline>
    <MuiThemeProvider theme={theme}>
      {children}
    </MuiThemeProvider>
  </CssBaseline>
)

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export default ThemeProvider
