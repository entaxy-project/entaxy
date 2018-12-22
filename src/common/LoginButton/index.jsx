import React from 'react'
import PropTypes from 'prop-types'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Avatar from '@material-ui/core/Avatar'
import Popper from '@material-ui/core/Popper'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'
import AccountBoxIcon from '@material-ui/icons/AccountBox'
import Paper from '@material-ui/core/Paper'
import Fade from '@material-ui/core/Fade'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Tooltip from '@material-ui/core/Tooltip'
import { userLogout } from '../../store/user/actions'

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
    handleLogout: () => { dispatch(userLogout()) }
  }
}

export class LoginButtonComponent extends React.Component {
  state = {
    anchorEl: null,
    open: false
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
      handleLogout
    } = this.props

    return (
      <ClickAwayListener onClickAway={this.handleClose}>
        <div className={classes.root}>
          { user.isAuthenticatedWith === 'blockstack' &&
            <Tooltip id="tooltip-icon" title={user.username}>
              <Avatar
                src={user.pictureUrl}
                alt={user.name}
              />
            </Tooltip>
          }
          { user.isAuthenticatedWith === 'guest' &&
            <Avatar alt={user.name}>
              <AccountBoxIcon fontSize="small" />
            </Avatar>
          }
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
}

LoginButtonComponent.propTypes = {
  classes: PropTypes.object,
  user: PropTypes.object.isRequired,
  handleLogout: PropTypes.func.isRequired,
  history: PropTypes.object
}

LoginButtonComponent.defaultProps = {
  classes: null,
  history: null
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles)
)(LoginButtonComponent)
