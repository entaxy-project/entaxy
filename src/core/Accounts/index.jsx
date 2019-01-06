/* eslint-disable no-console */
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
import Chip from '@material-ui/core/Chip'
import { NavLink } from 'react-router-dom'
import grey from '@material-ui/core/colors/grey'
import InstitutionIcon from '../../common/InstitutionIcon'
import { currencyFormatter } from '../../util/stringFormatter'

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
  },
  smallChipRoot: {
    fontSize: 9,
    height: 'auto',
    marginLeft: 10
  },
  smallChipLabel: {
    padding: '1px 7px'
  }
})

const mapStateToProps = state => ({
  accounts: state.accounts,
  settings: state.settings
})

export const AccountsComponent = ({
  classes,
  accounts,
  accountId,
  settings
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
    {Object.keys(accounts.byId).length === 0 &&
      <Typography variant="caption" className={classes.noAccounts}>
        You don&apos;t have any accounts yet
      </Typography>
    }
    <List dense={true}>
      {Object.keys(accounts.byInstitution).map(institution => (
        <div key={institution}>
          <ListItem className={classes.institutionListItem}>
            <ListItemIcon>
              <InstitutionIcon institution={institution} size="small" />
            </ListItemIcon>
            <ListItemText primary={institution} className={classes.institution} />
          </ListItem>
          <List dense={true}>
            {accounts.byInstitution[institution].accountIds.map((id) => {
              const account = accounts.byId[id]
              return (
                <ListItem
                  className={classes.account}
                  button
                  key={id}
                  selected={id === accountId}
                  component={NavLink}
                  to={`/accounts/${id}/transactions`}
                >
                  <ListItemText
                    primary={account.name}
                    secondary={
                      <span>
                        {currencyFormatter(settings.locale, account.currency)(account.currentBalance)}
                        {account.currency !== settings.currency &&
                          <Chip
                            label={account.currency}
                            component="span"
                            classes={{
                              root: classes.smallChipRoot,
                              label: classes.smallChipLabel
                            }}
                          />
                        }
                      </span>
                    }
                  />
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
              )
            })}
          </List>
        </div>
      ))}
    </List>
  </List>
)

AccountsComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  accounts: PropTypes.object.isRequired,
  accountId: PropTypes.string,
  settings: PropTypes.object.isRequired
}

AccountsComponent.defaultProps = {
  accountId: null
}

export default compose(
  connect(mapStateToProps),
  withStyles(styles)
)(AccountsComponent)
