import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import DashboardIcon from '@material-ui/icons/Dashboard'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import grey from '@material-ui/core/colors/grey'
import { currencyFormatter } from '../../util/stringFormatter'
import InstitutionIcon from '../../common/InstitutionIcon'
import AccountsChart from '../Accounts/AccountsChart'
import LinkTo from '../../common/LinkTo'

const styles = theme => ({
  balancePaper: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    paddingLeft: 150,
    position: 'relative'
  },
  balanceAmount: {
    fontWeight: 200
  },
  balancePaperIcon: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: -10,
    left: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(60deg, #66bb6a, #43a047)'
  },
  balanceIcon: {
    color: 'white'
  },
  accountsTable: {
    padding: theme.spacing(2)
  },
  institutionWrapper: {
    display: 'flex'
  },
  institutionIcon: {
    marginRight: 16,
    color: grey[600]
  },
  accountWrapper: {
    paddingLeft: theme.spacing(4)
  },
  accountName: {
    paddingLeft: 20
  },
  accountsChart: {
    padding: theme.spacing(2),
    height: 240,
    minWidth: 150
  },
  noAccountsPaper: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    textAlign: 'center'
  },
  newAccountButton: {
    margin: theme.spacing(3)
  },
  newAccountButton2: {
    marginTop: theme.spacing(1),
    textAlign: 'right'
  }
})

const mapStateToProps = state => ({
  accounts: state.accounts,
  settings: state.settings,
  totalBalance: Object.values(state.accounts.byInstitution).reduce(
    (balance, institution) => balance + institution.balance,
    0
  )
})

export const DashboardComponent = ({
  classes,
  accounts,
  settings,
  totalBalance,
  history
}) => {
  const formatCurrency = (currency, value) => (
    currencyFormatter(settings.locale, currency)(value)
  )

  const handleClick = (account) => {
    history.push(`/accounts/${account.id}/transactions`)
  }

  const userHasAccounts = Object.keys(accounts.byInstitution).length > 0
  return (
    <Container>
      {!userHasAccounts && (
        <Paper className={classes.noAccountsPaper}>
          <Typography variant="h6">
            You don&apos;t have any accounts yet.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            component={LinkTo('/accounts/new')}
            className={classes.newAccountButton}
          >
            Add an account
          </Button>
          <Typography variant="body1">
            You can keep track of all the accounts you have from any institution.
          </Typography>
        </Paper>
      )}
      {userHasAccounts && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.balancePaper}>
              <Typography variant="body1" color="textSecondary" align="right">
                Total
              </Typography>
              <Typography variant="h5" align="right" className={classes.balanceAmount}>
                {formatCurrency(settings.currency, totalBalance)}
              </Typography>
              <Paper className={classes.balancePaperIcon}>
                <DashboardIcon className={classes.balanceIcon} />
              </Paper>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={4}>
                <Paper className={classes.accountsChart}>
                  <AccountsChart totalBalance={totalBalance} />
                </Paper>
              </Grid>
              <Grid item xs={8}>
                <Paper className={classes.accountsTable}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Institution / Account</TableCell>
                        <TableCell>Account balance</TableCell>
                        <TableCell align="right">{`Total ${settings.currency}`}</TableCell>
                      </TableRow>
                    </TableHead>
                    {Object.keys(accounts.byInstitution).sort().map(institution => (
                      Object.values(accounts.byInstitution[institution].groups).map(accountGroup => (
                        <TableBody key={accountGroup.id}>
                          <TableRow>
                            <TableCell>
                              <span className={classes.institutionWrapper}>
                                <InstitutionIcon
                                  institution={institution}
                                  size="small"
                                  className={classes.institutionIcon}
                                />
                                <Typography variant="subtitle2">{institution}</Typography>
                              </span>
                            </TableCell>
                            <TableCell align="right" />
                            <TableCell align="right">
                              <Typography variant="subtitle2">
                                {formatCurrency(settings.currency, accountGroup.balance)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          {accountGroup.accountIds.map((id) => {
                            const account = accounts.byId[id]
                            return (
                              <TableRow key={id} hover onClick={() => handleClick(account)}>
                                <TableCell className={classes.accountWrapper}>
                                  {account.name}
                                </TableCell>
                                <TableCell>
                                  {formatCurrency(account.currency, account.currentBalance.accountCurrency)}
                                </TableCell>
                                <TableCell align="right">
                                  {formatCurrency(settings.currency, account.currentBalance.localCurrency)}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      ))
                    ))}
                  </Table>
                  <div className={classes.newAccountButton2}>
                    <Button
                      color="secondary"
                      component={LinkTo('/accounts/new')}
                    >
                      New account
                    </Button>
                  </div>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Container>
  )
}

DashboardComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  accounts: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  totalBalance: PropTypes.number.isRequired,
  history: PropTypes.object.isRequired
}

export default compose(
  connect(mapStateToProps),
  withStyles(styles)
)(DashboardComponent)
