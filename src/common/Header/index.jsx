import React from 'react'
import PropTypes from 'prop-types'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import Logo from '../Logo/index'
import LoginButton from '../LoginButton'
import LinkTo from '../LinkTo'

const styles = theme => ({
  root: {
    paddingTop: 70
  },
  header: {
    zIndex: theme.zIndex.drawer + 1
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between'
  }
})

const Header = ({ classes, children, match }) => {
  const buttonColourFor = (path) => {
    let paths = path
    if (typeof path === 'string') {
      paths = [paths]
    }
    const matched = paths.reduce((res, p) => (
      res || match.path.startsWith(p)
    ), false)
    return matched ? 'secondary' : 'inherit'
  }

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.header}>
        <Toolbar className={classes.toolbar}>
          <Logo />
          <div>
            <Button
              color={buttonColourFor('/dashboard')}
              component={LinkTo('/dashboard')}
            >
              Dashboard
            </Button>
            <Button
              color={buttonColourFor(['/accounts', '/institutions'])}
              component={LinkTo('/accounts')}
            >
              Accounts
            </Button>
            <Button
              color={buttonColourFor('/budget')}
              component={LinkTo('/budget')}
            >
              Budget
            </Button>
          </div>
          <LoginButton />
        </Toolbar>
      </AppBar>
      { children }
    </div>
  )
}

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
}

export default withStyles(styles)(Header)
