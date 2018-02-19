import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Header from '../../common/Header'
import Routes from '../../routes'
import 'typeface-roboto'
import Grid from 'material-ui/Grid'
import Paper from 'material-ui/Paper'
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles'
import purple from 'material-ui/colors/purple'
import Reboot from 'material-ui/Reboot'
import createHistory from 'history/createBrowserHistory'

const history = createHistory()


const theme = createMuiTheme({
  palette: {
    primary: { main: purple[500] }, // Purple and green play nicely together.
    secondary: { main: '#11cb5f' }, // This is just green.A700 as hex.
  },
});

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    margin: '10px',
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
})

const App = (props) => {
  const { classes } = props
    return (
    <Reboot>
      <MuiThemeProvider theme={theme}>
        <Header/>
        <div className={classes.root}>
          <Grid container spacing={0}>
          	<Grid item xs>
              <Paper className={classes.paper}>
        		    <Routes history= {history}/>
              </Paper>
      			</Grid>		    
      		</Grid>
        </div>
      </MuiThemeProvider>
    </Reboot>
  )
}
App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
