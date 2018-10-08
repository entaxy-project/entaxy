import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import Avatar from '@material-ui/core/Avatar'
import Popper from '@material-ui/core/Popper'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'
import Paper from '@material-ui/core/Paper'
import Fade from '@material-ui/core/Fade'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Tooltip from '@material-ui/core/Tooltip'
import { withStyles } from '@material-ui/core/styles'
import { userLogin, userLogout } from '../../store/user/actions'

const styles = {
  root: {
    display: 'flex'
  }
}

const mapStateToProps = ({ user }) => {
  return { user }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleLogin: () => { dispatch(userLogin()) },
    handleLogout: () => { dispatch(userLogout()) }
  }
}

export class LoginButtonComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      anchorEl: null,
      open: false
    }
  }

  handleClick = (event) => {
    const { currentTarget } = event
    this.setState(state => ({
      anchorEl: currentTarget,
      open: !state.open
    }))
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  render() {
    const { anchorEl, open } = this.state
    const {
      classes,
      user,
      handleLogin,
      handleLogout
    } = this.props

    if (user.isAuthenticated) {
      return (
        <ClickAwayListener onClickAway={this.handleClose}>
          <div className={classes.root}>
            <Tooltip id="tooltip-icon" title={user.username}>
              <Avatar
                src={user.pictureUrl}
                alt={user.name}
              />
            </Tooltip>
            <Button
              color="inherit"
              aria-owns={open ? 'menu-list-grow' : null}
              onClick={this.handleClick}
            >
              {user.name}
            </Button>
            <Popper open={open} anchorEl={anchorEl} transition>
              {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350}>
                  <Paper>
                    <MenuList role="menu">
                      <MenuItem>Profile</MenuItem>
                      <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </MenuList>
                  </Paper>
                </Fade>
              )}
            </Popper>
          </div>
        </ClickAwayListener>
      )
    }
    return (
      <Button color="inherit" onClick={handleLogin}>
        Login
      </Button>
    )
  }
}

LoginButtonComponent.propTypes = {
  classes: PropTypes.object,
  user: PropTypes.object.isRequired,
  handleLogin: PropTypes.func.isRequired,
  handleLogout: PropTypes.func.isRequired
}

LoginButtonComponent.defaultProps = {
  classes: null
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LoginButtonComponent))
