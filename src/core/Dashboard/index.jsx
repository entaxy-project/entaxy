import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import DashboardIcon from '@material-ui/icons/Dashboard'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import grey from '@material-ui/core/colors/grey'
import LinkTo from '../../common/LinkTo'
import { currencyFormatter } from '../../util/stringFormatter'
import InstitutionIcon from '../../common/InstitutionIcon'
import AccountsChart from './AccountsChart'
import BudgetChart from './BudgetChart'

const styles = theme => ({
  root: {
    padding: theme.spacing(2)
  },
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
  noAccounts: {
    background: grey[100],
    margin: '0 20px 20px 25px',
    padding: theme.spacing(1)
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
    paddingLeft: theme.spacing(2)
  },
  accountName: {
    paddingLeft: 20
  },
  accountsChart: {
    padding: theme.spacing(2),
    height: 240,
    minWidth: 150
  },
  budgetChart: {
    padding: theme.spacing(2),
    height: 400,
    minWidth: 200
  }
})

const mapStateToProps = state => ({
  accounts: state.accounts,
  budget: state.budget,
  formatCurrency: currencyFormatter(state.settings.locale, state.settings.currency),
  totalBalance: Object.values(state.accounts.byInstitution).reduce(
    (balance, institution) => balance + institution.balance,
    0
  )
})

export const DashboardComponent = ({
  classes,
  accounts,
  budget,
  formatCurrency,
  totalBalance
}) => {
  const userHasAccounts = Object.keys(accounts.byInstitution).length > 0
  const userHasBudget = Object.keys(budget.rules).length > 0
  return (
    <Container>
      {!userHasAccounts && (
        <Typography variant="caption" className={classes.noAccounts}>
          You don&apos;t have any accounts yet
        </Typography>
      )}
      {userHasAccounts && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.balancePaper}>
              <Typography variant="body1" color="textSecondary" align="right">
                Total
              </Typography>
              <Typography variant="h5" align="right" className={classes.balanceAmount}>
                {formatCurrency(totalBalance)}
              </Typography>
              <Paper className={classes.balancePaperIcon}>
                <DashboardIcon className={classes.balanceIcon} />
              </Paper>
            </Paper>
          </Grid>
          {userHasBudget && (
            <Grid item xs={12}>
              <Paper className={classes.budgetChart}>
                <BudgetChart />
              </Paper>
            </Grid>
          )}
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
                            <TableCell align="right">
                              <Typography variant="subtitle2">
                                {formatCurrency(accountGroup.balance)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          {accountGroup.accountIds.map((id) => {
                            const account = accounts.byId[id]
                            return (
                              <TableRow key={id}>
                                <TableCell>
                                  <span className={classes.accountWrapper}>
                                    <Typography
                                      variant="body2"
                                      color="primary"
                                      component={LinkTo(`/accounts/${account.id}/transactions`)}
                                    >
                                      {account.name}
                                    </Typography>
                                  </span>
                                </TableCell>
                                <TableCell align="right">
                                  {formatCurrency(account.currentBalance.localCurrency)}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      ))
                    ))}
                  </Table>
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
  budget: PropTypes.object.isRequired,
  formatCurrency: PropTypes.func.isRequired,
  totalBalance: PropTypes.number.isRequired
}

export default compose(
  connect(mapStateToProps),
  withStyles(styles)
)(DashboardComponent)
