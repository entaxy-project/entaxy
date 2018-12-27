import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListSubheader from '@material-ui/core/ListSubheader'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import IconButton from '@material-ui/core/IconButton'
import AddIcon from '@material-ui/icons/Add'
import EditIcon from '@material-ui/icons/Edit'
import { NavLink } from 'react-router-dom'
import grey from '@material-ui/core/colors/grey'
import { sortedAccountsGroupedByInstitution } from '../../store/accounts/selectors'
import InstitutionIcon from '../../common/InstitutionIcon'

const styles = theme => ({
  noAccounts: {
    background: grey[100],
    margin: '0 20px 20px 25px',
    padding: theme.spacing.unit
  },
  institutionListItem: {
    padding: '4px 24px'
  },
  institution: {
    paddingLeft: 0
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
    groupedAccounts: sortedAccountsGroupedByInstitution(state)
  }
}

export const AccountsComponent = ({
  classes,
  groupedAccounts,
  accountId
}) => (
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
              to="/accounts/new"
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </ListItemSecondaryAction>
      </ListSubheader>
    }
  >
    {Object.keys(groupedAccounts).length === 0 &&
      <Typography variant="caption" className={classes.noAccounts}>
        You don&apos;t have any accounts yet
      </Typography>
    }
    <List dense={true}>
      {Object.keys(groupedAccounts).map(institution => (
        <div key={institution}>
          <ListItem className={classes.institutionListItem}>
            <ListItemIcon>
              <InstitutionIcon institution={institution} size="small" />
            </ListItemIcon>
            <ListItemText primary={institution} className={classes.institution} />
          </ListItem>
          <List dense={true}>
            {groupedAccounts[institution].map(account => (
              <ListItem
                className={classes.account}
                button
                key={account.id}
                selected={account.id === accountId}
                component={NavLink}
                to={`/accounts/${account.id}/transactions`}
              >
                <ListItemText primary={account.name} secondary="$100.00" />
                <ListItemSecondaryAction>
                  <Tooltip id="tooltip-icon" title="Edit account">
                    <IconButton
                      aria-label="Edit account"
                      className={classes.smallButton}
                      component={NavLink}
                      to={`/accounts/${account.id}/edit`}
                    >
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
)

AccountsComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  groupedAccounts: PropTypes.object.isRequired,
  accountId: PropTypes.string
}

AccountsComponent.defaultProps = {
  accountId: null
}

export default compose(
  connect(mapStateToProps),
  withStyles(styles)
)(AccountsComponent)
