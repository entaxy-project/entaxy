import React from 'react'
import PropTypes from 'prop-types'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import { withStyles } from '@material-ui/core/styles'
import Logo from '../Logo/index'
import LoginButton from '../LoginButton'
import TopNav from '../TopNav'

const styles = theme => ({
  root: {
    zIndex: theme.zIndex.drawer + 1
  },
  toolbar: {
    display: 'flex',
    'justify-content': 'space-between'
  }
})

const Header = ({ classes }) => (
  <AppBar position="fixed" className={classes.root}>
    <Toolbar className={classes.toolbar}>
      <Logo />
      <TopNav />
      <LoginButton />
    </Toolbar>
  </AppBar>
)

Header.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Header)
