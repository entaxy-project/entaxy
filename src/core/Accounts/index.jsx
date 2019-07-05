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
import SettingsIcon from '@material-ui/icons/Settings'
import grey from '@material-ui/core/colors/grey'
import InstitutionIcon from '../../common/InstitutionIcon'
import { currencyFormatter } from '../../util/stringFormatter'
import LinkTo from '../../common/LinkTo'

const styles = theme => ({
  noAccounts: {
    background: grey[100],
    margin: '0 20px 20px 25px',
    padding: theme.spacing(1)
  },
  institutionListRoot: {
    padding: 0
  },
  institutionListItem: {
    paddingRight: 0
  },
  institutionListItemIcon: {
    marginLeft: 10,
    minWidth: 30
  },
  institution: {
    padding: 0,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    maxWidth: 100,
    fontWeight: 500
  },
  account: {
    padding: '0 0 0 40px'
  },
  ListItemText: {
    margin: '3px 0 3px 0'
  },
  smallFont: {
    fontSize: '95%'
  },
  smallButton: {
    padding: 4,
    marginRight: -6
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
  settings: state.settings,
  accounts: state.accounts
})

export const AccountsComponent = ({
  classes,
  settings,
  accounts,
  accountId
}) => {
  const userHasAccounts = Object.keys(accounts.byInstitution).length > 0
  return (
    <List
      component="nav"
      dense={true}
      subheader={(
        <ListSubheader component="div">
          Accounts
          <ListItemSecondaryAction>
            <Tooltip id="tooltip-icon" title="New account">
              <IconButton
                aria-label="New account"
                className={classes.smallButton}
                component={LinkTo('/accounts/new')}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </ListItemSecondaryAction>
        </ListSubheader>
      )}
    >
      {!userHasAccounts && (
        <Typography variant="caption" className={classes.noAccounts}>
          You don&apos;t have any accounts yet
        </Typography>
      )}
      {userHasAccounts && (
        <List dense={true} className={classes.institutionListRoot}>
          {Object.keys(accounts.byInstitution).sort().map(institution => (
            Object.values(accounts.byInstitution[institution].groups).map(accountGroup => (
              <div key={`${institution}-${accountGroup.id}`}>
                <ListItem>
                  <ListItemIcon className={classes.institutionListItemIcon}>
                    <InstitutionIcon institution={institution} size="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={institution}
                    className={classes.institutionListItem}
                    classes={{ primary: classes.institution }}
                    title={institution}
                  />
                  {accountGroup.type === 'api' && (
                    <ListItemSecondaryAction>
                      <Tooltip id="tooltip-icon" title="Edit API details">
                        <IconButton
                          aria-label="Edit API details"
                          className={classes.smallButton}
                          component={LinkTo(`/institutions/${institution}/import/${accountGroup.id}/edit`)}
                        >
                          <SettingsIcon className={classes.smallIcon} />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
                <List dense={true} className={classes.institutionListRoot}>
                  {accountGroup.accountIds.map((id) => {
                    if (accounts.byId[id] === undefined) return undefined
                    const account = accounts.byId[id]
                    return (
                      <ListItem
                        className={classes.account}
                        button
                        key={account.id}
                        selected={account.id === accountId}
                        component={LinkTo(`/accounts/${account.id}/transactions`)}
                      >
                        <ListItemText
                          classes={{
                            root: classes.ListItemText,
                            primary: classes.smallFont,
                            secondary: classes.smallFont
                          }}
                          primary={account.name}
                          secondary={
                            currencyFormatter(settings.locale, account.currency)(account.currentBalance.accountCurrency)
                          }
                        />
                        {accountGroup.type === 'default' && (
                          <ListItemSecondaryAction>
                            <Tooltip id="tooltip-icon" title="Edit account">
                              <IconButton
                                aria-label="Edit account"
                                className={classes.smallButton}
                                component={LinkTo(`/accounts/${id}/edit`)}
                              >
                                <EditIcon className={classes.smallIcon} />
                              </IconButton>
                            </Tooltip>
                          </ListItemSecondaryAction>
                        )}
                      </ListItem>
                    )
                  })}
                </List>
              </div>
            ))
          ))}
        </List>
      )}
    </List>
  )
}

AccountsComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  accounts: PropTypes.object.isRequired,
  accountId: PropTypes.string
}

AccountsComponent.defaultProps = {
  accountId: null
}

export default compose(
  connect(mapStateToProps),
  withStyles(styles)
)(AccountsComponent)
