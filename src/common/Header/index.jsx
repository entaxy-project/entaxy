import React from 'react'
import AppBar from 'material-ui/AppBar'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'
import { withStyles } from 'material-ui/styles'
import Logo from '../Logo/index'

const styles = {
  flex: {
    flex: 1
  }
}

function Header(props) {
  const { classes } = props
  return (
    <AppBar position="static">
      <Toolbar>
        <Logo width="30px" />
        <Typography variant="title" color="inherit" className={classes.flex}>
          Entaxy
        </Typography>
        <Button color="inherit">Login</Button>
      </Toolbar>
    </AppBar>
  )
}

export default withStyles(styles)(Header)
