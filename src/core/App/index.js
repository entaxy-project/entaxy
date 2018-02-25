import React from 'react'
// import PropTypes from 'prop-types';
import Header from '../../common/Header'
import Routes from '../../routes'
import 'typeface-roboto'
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles'
import Reboot from 'material-ui/Reboot'
import createHistory from 'history/createBrowserHistory'
import blueGrey from 'material-ui/colors/blueGrey';
import teal from 'material-ui/colors/teal';

const history = createHistory()


const theme = createMuiTheme({
  palette: {
    primary: { main: blueGrey[800] },
    secondary: { main: teal[500] },
  },
});

const App = (props) => {
  // const { classes } = props
  return (
    <Reboot>
      <MuiThemeProvider theme={theme}>
        <Header/>
		    <Routes history= {history}/>
      </MuiThemeProvider>
    </Reboot>
  )
}

// App.propTypes = {
//   classes: PropTypes.object.isRequired,
// };

export default App
