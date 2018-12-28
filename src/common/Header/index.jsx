import React from 'react'
import PropTypes from 'prop-types'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import { withStyles } from '@material-ui/core/styles'
import Logo from '../Logo/index'
import LoginButton from '../LoginButton'
import TopNav from '../TopNav'
import LeftDrawer from '../../common/LeftDrawer'

const styles = theme => ({
  root: {
    paddingTop: 70,
    marginLeft: 200
  },
  header: {
    zIndex: theme.zIndex.drawer + 1
  },
  toolbar: {
    display: 'flex',
    'justify-content': 'space-between'
  }
})

const Header = ({ classes, children }) => (
  <div className={classes.root}>
    <AppBar position="fixed" className={classes.header}>
      <Toolbar className={classes.toolbar}>
        <Logo />
        <TopNav />
        <LoginButton />
      </Toolbar>
    </AppBar>
    <LeftDrawer />
    {children}
  </div>
)

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired
}

export default withStyles(styles)(Header)
