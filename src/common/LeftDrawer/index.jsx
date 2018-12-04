import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import ListSubheader from '@material-ui/core/ListSubheader'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Typography from '@material-ui/core/Typography'
import DashboardIcon from '@material-ui/icons/Dashboard'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import Divider from '@material-ui/core/Divider'
import grey from '@material-ui/core/colors/grey'

const styles = theme => ({
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    maxWidth: 200
  },
  menuTitle: {
    margin: '20px'
  },
  button: {
    fontSize: 10,
    padding: 5,
    minHeight: 22,
    marginLeft: 25
  },
  leftIcon: {
    marginRight: theme.spacing.unit
  },
  iconSmall: {
    fontSize: 12
  },
  noAccounts: {
    background: grey[100],
    margin: '0 20px 20px 25px',
    padding: theme.spacing.unit
  }
})

const LeftDrawer = ({ classes }) => (
  <Drawer
    elevation={3}
    variant="permanent"
    classes={{
      paper: classes.drawerPaper
    }}
  >
    <div className={classes.toolbar} />
    <List>
      <ListItem button key="Dashboard">
        <ListItemIcon><DashboardIcon /></ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItem>
    </List>
    <Divider />
    <List
      component="nav"
      subheader={<ListSubheader component="div">Accounts</ListSubheader>}
    >
      <Typography variant="caption" className={classes.noAccounts}>
        You don&apos;t have any accounts yet
      </Typography>
      <Button variant="contained" color="secondary" className={classes.button}>
        <AddIcon className={classNames(classes.leftIcon, classes.iconSmall)} />
        Add account
      </Button>
    </List>
  </Drawer>
)

LeftDrawer.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(LeftDrawer)
