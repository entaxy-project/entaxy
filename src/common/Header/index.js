import React from 'react'
import AppBar from 'material-ui/AppBar'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'
import { withStyles } from 'material-ui/styles'

const styles = {
  flex: {
    flex: 1,
  },
};

function Header(props) {
	const { classes } = props
	return (
		<AppBar position="static">
	    <Toolbar>
	      <Typography variant="title" color="inherit" className={classes.flex}>
	        Bean Counter
	      </Typography>
	      <Button color="inherit">Login</Button>
	    </Toolbar>
	  </AppBar>
  )
}

export default withStyles(styles)(Header)