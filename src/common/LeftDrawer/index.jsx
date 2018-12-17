/* eslint no-console: 0 */
import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import ListSubheader from '@material-ui/core/ListSubheader'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'
import DashboardIcon from '@material-ui/icons/Dashboard'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import IconButton from '@material-ui/core/IconButton'
import AddIcon from '@material-ui/icons/Add'
import EditIcon from '@material-ui/icons/Edit'
import Divider from '@material-ui/core/Divider'
import { NavLink } from 'react-router-dom'
import grey from '@material-ui/core/colors/grey'
import { sortedAccountsGroupedByInstitution } from '../../store/accounts/selectors'
import { selectAccount } from '../../store/settings/actions'

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
    marginLeft: 10,
    width: 50
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
  },
  institution: {
    padding: '4px 24px'
  },
  account: {
    padding: '4px 24px 4px 40px'
  },
  smallButton: {
    padding: 4,
    marginRight: 5
  },
  smallIcon: {
    fontSize: 18
  }
})

const mapStateToProps = (state) => {
  return {
    groupedAccounts: sortedAccountsGroupedByInstitution(state),
    selectedAccountId: state.settings.selectedAccountId
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleSelectAccount: (accountId) => { dispatch(selectAccount(accountId)) }
  }
}

const LeftDrawer = ({
  classes,
  groupedAccounts,
  selectedAccountId,
  handleSelectAccount
}) => (
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
      dense={true}
      subheader={
        <ListSubheader component="div">
          Accounts
          <ListItemSecondaryAction>
            <Tooltip id="tooltip-icon" title="New account">
              <IconButton
                aria-label="New account"
                className={classes.smallButton}
                component={NavLink}
                to="/accounts"
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </ListItemSecondaryAction>
        </ListSubheader>
      }
    >
      {groupedAccounts.length === 0 &&
        <Typography variant="caption" className={classes.noAccounts}>
          You don&apos;t have any accounts yet
        </Typography>
      }
      <List dense={true}>
        {Object.keys(groupedAccounts).map(institution => (
          <div key={institution}>
            <ListItem className={classes.institution}>
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary={institution} />
            </ListItem>
            <List dense={true}>
              {groupedAccounts[institution].map(account => (
                <ListItem
                  className={classes.account}
                  button
                  key={account.id}
                  selected={account.id === selectedAccountId}
                  onClick={() => handleSelectAccount(account.id)}
                >
                  <ListItemText primary={account.name} secondary="$100.00" />
                  <ListItemSecondaryAction>
                    <Tooltip id="tooltip-icon" title="Edit account">
                      <IconButton aria-label="Edit account" className={classes.smallButton}>
                        <EditIcon className={classes.smallIcon} />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </div>
        ))}
      </List>
    </List>
  </Drawer>
)

LeftDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  groupedAccounts: PropTypes.object.isRequired,
  selectedAccountId: PropTypes.string,
  handleSelectAccount: PropTypes.func.isRequired
}

LeftDrawer.defaultProps = {
  selectedAccountId: null
}


export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles)
)(LeftDrawer)
