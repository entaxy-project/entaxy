import React, { useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Avatar from '@material-ui/core/Avatar'
import Popper from '@material-ui/core/Popper'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'
import Divider from '@material-ui/core/Divider'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Settings from '@material-ui/icons/Settings'
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew'
import Paper from '@material-ui/core/Paper'
import Fade from '@material-ui/core/Fade'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Tooltip from '@material-ui/core/Tooltip'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import LinkTo from '../LinkTo'
import { userLogout } from '../../store'
import packageJson from '../../../package.json'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    minWidth: 135,
    float: 'right'
  },
  popper: {
    zIndex: theme.zIndex.drawer + 1
  },
  menuIcon: {
    marginRight: '5px',
    verticalAlign: 'bottom',
    fill: theme.palette.text.secondary
  }
}))

const LoginButton = () => {
  const classes = useStyles()
  const user = useSelector((state) => state.user)
  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return
    }
    setOpen(false)
  }

  if (!user.isAuthenticatedWith) return null
  return (
    <div className={classes.root}>
      { user.isAuthenticatedWith === 'blockstack' && (
        <Tooltip id="tooltip-icon" title={user.username}>
          <Avatar src={user.pictureUrl} alt={user.name} />
        </Tooltip>
      )}
      { user.isAuthenticatedWith === 'guest' && (
        <Avatar alt={user.name} src={user.pictureUrl} />
      )}
      <Button
        ref={anchorRef}
        color="inherit"
        aria-owns={open ? 'menu-list-grow' : null}
        onClick={handleToggle}
        data-testid="userNavButton"
      >
        {user.name}
        <ArrowDropDownIcon />
      </Button>
      <Popper open={open} anchorEl={anchorRef.current} transition className={classes.popper}>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList role="menu">
                  <MenuItem onClick={handleToggle} component={LinkTo('/settings')}>
                    <ListItemIcon>
                      <Settings />
                    </ListItemIcon>
                    <ListItemText primary="Settings" />
                  </MenuItem>
                  <MenuItem onClick={userLogout} data-testid="logoutButton">
                    <ListItemIcon>
                      <PowerSettingsNewIcon />
                    </ListItemIcon>
                    <ListItemText primary="Close session" />
                  </MenuItem>
                  <Divider />
                  <MenuItem disabled={true}>
                    <small>
                      Version&nbsp;
                      {packageJson.version}
                    </small>
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </div>
  )
}

export default LoginButton
