import React from 'react'
import PropTypes from 'prop-types'
import AppBar from 'material-ui/AppBar'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'
import { withStyles } from 'material-ui/styles'

import Logo from '../Logo/index'
import AuthenticationButton from './../AuthenticationButton/index'
import ProfilePicture from './../ProfilePicture/index'

const styles = {
  flex: {
    flex: 1
  }
}

const Header = ({ classes }) => (
  <AppBar position="static">
    <Toolbar>
      <Logo width="30px" />
      <Typography variant="title" color="inherit" className={classes.flex}>
        Entaxy
      </Typography>
      <ProfilePicture />
      <AuthenticationButton />
    </Toolbar>
  </AppBar>
)

Header.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Header)
