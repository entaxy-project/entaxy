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
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Settings from '@material-ui/icons/Settings'
import Icon from '@mdi/react'
import { mdiLogout } from '@mdi/js'
import AccountBoxIcon from '@material-ui/icons/AccountBox'
import Paper from '@material-ui/core/Paper'
import Fade from '@material-ui/core/Fade'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Tooltip from '@material-ui/core/Tooltip'
import LinkTo from '../LinkTo'
import { userLogout } from '../../store/user/actions'

const styles = theme => ({
  root: {
    display: 'flex'
  },
  popper: {
    zIndex: theme.zIndex.drawer + 1
  },
  menuIcon: {
    marginRight: '5px',
    'vertical-align': 'bottom',
    fill: theme.palette.text.secondary
  }
})

const mapStateToProps = ({ user }) => ({ user })

const mapDispatchToProps = dispatch => ({
  handleLogout: () => { dispatch(userLogout()) }
})

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
          { user.isAuthenticatedWith === 'blockstack' && (
            <Tooltip id="tooltip-icon" title={user.username}>
              <Avatar
                src={user.pictureUrl}
                alt={user.name}
              />
            </Tooltip>
          )}
          { user.isAuthenticatedWith === 'guest' && (
            <Avatar alt={user.name}>
              <AccountBoxIcon fontSize="small" />
            </Avatar>
          )}
          <Button
            color="inherit"
            aria-owns={open ? 'menu-list-grow' : null}
            onClick={this.handleClick}
          >
            {user.name}
          </Button>
          <Popper open={open} anchorEl={anchorEl} transition className={classes.popper}>
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={350}>
                <Paper>
                  <MenuList role="menu">

                    <MenuItem component={LinkTo('/settings')}>
                      <ListItemIcon>
                        <Settings />
                      </ListItemIcon>
                      <ListItemText primary="Settings" />
                    </MenuItem>
                    <MenuItem component={LinkTo('/budget-categories')}>
                      <ListItemIcon>
                        <Settings />
                      </ListItemIcon>
                      <ListItemText primary="Budget Categories" />
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <Icon
                          path={mdiLogout}
                          size={1}
                          className={classes.menuIcon}
                        />
                      </ListItemIcon>
                      <ListItemText primary="Logout" />
                    </MenuItem>
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
