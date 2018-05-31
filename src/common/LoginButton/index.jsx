import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import Avatar from '@material-ui/core/Avatar'
import { Manager, Reference, Popper } from 'react-popper'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'
import Paper from '@material-ui/core/Paper'
import Grow from '@material-ui/core/Grow'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Tooltip from '@material-ui/core/Tooltip'
import { withStyles } from '@material-ui/core/styles'
import { userLogin, userLogout } from '../../store/user/actions'

const styles = () => ({
  root: {
    display: 'flex'
  }
})

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
      open: false
    }
  }

  handleToggle = () => {
    this.setState({ open: !this.state.open })
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  render() {
    const { open } = this.state
    const {
      classes,
      user,
      handleLogin,
      handleLogout
    } = this.props

    if (user.isAuthenticated) {
      return (
        <Manager>
          <Reference>
            {({ ref }) => (
              <div ref={ref} className={classes.root}>
                <Tooltip id="tooltip-icon" title={user.username}>
                  <Avatar
                    src={user.pictureUrl}
                    alt={user.name}
                  />
                </Tooltip>
                <Button
                  color="inherit"
                  aria-owns={open ? 'menu-list-grow' : null}
                  onClick={this.handleToggle}
                >
                  {user.name}
                </Button>
              </div>
            )}
          </Reference>
          <Popper
            placement="bottom-start"
            eventsEnabled={open}
          >
            {({
              ref,
              style,
              placement
            }) => (
              <div ref={ref} style={{ ...style, zIndex: 1 }} data-placement={placement}>
                <ClickAwayListener onClickAway={this.handleClose}>
                  <Grow in={open} id="menu-list-grow" style={{ transformOrigin: '0 0 0' }} ref={ref}>
                    <Paper>
                      <MenuList role="menu">
                        <MenuItem>Profile</MenuItem>
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                      </MenuList>
                    </Paper>
                  </Grow>
                </ClickAwayListener>
              </div>
            )}
          </Popper>
        </Manager>
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
