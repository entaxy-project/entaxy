import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import DashboardIcon from '@material-ui/icons/Dashboard'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import { currencyFormatter } from '../../util/stringFormatter'

const styles = theme => ({
  balancePaper: {
    margin: theme.spacing.unit * 2,
    padding: theme.spacing.unit * 2,
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
  summaryPaper: {
    margin: theme.spacing.unit * 2,
    padding: theme.spacing.unit * 2
  }
})

const mapStateToProps = state => ({
  formatCurrency: currencyFormatter(state.settings.locale, state.settings.currency),
  groupedAccounts: state.accounts.byInstitution,
  totalBalance: Object.values(state.accounts.byInstitution).reduce(
    (balance, institution) => balance + institution.balance,
    0
  )
})

export const DashboardComponent = ({
  classes,
  formatCurrency,
  groupedAccounts,
  totalBalance
}) => (
  <Grid container>
    <Grid container justify="flex-end" className={classes.root}>
      <Paper className={classes.balancePaper}>
        <Typography
          variant="body1"
          color="textSecondary"
          align="right"
        >
          Balance
        </Typography>
        <Typography
          variant="h5"
          align="right"
          className={classes.balanceAmount}
        >
          {formatCurrency(totalBalance)}
        </Typography>
        <Paper className={classes.balancePaperIcon}>
          <DashboardIcon className={classes.balanceIcon} />
        </Paper>
      </Paper>
    </Grid>
    <Paper className={classes.summaryPaper}>
      {Object.keys(groupedAccounts).length === 0 &&
        <Typography variant="caption" className={classes.noAccounts}>
          You don&apos;t have any accounts yet
        </Typography>
      }
      <Table className={classes.table}>
        <TableBody>
          {Object.keys(groupedAccounts).map(institution => (
            <TableRow key={institution}>
              <TableCell component="th" scope="row">{institution}</TableCell>
              <TableCell align="right">{formatCurrency(groupedAccounts[institution].balance)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  </Grid>
)

DashboardComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  formatCurrency: PropTypes.func.isRequired,
  groupedAccounts: PropTypes.object.isRequired,
  totalBalance: PropTypes.number.isRequired
}

export default compose(
  connect(mapStateToProps),
  withStyles(styles)
)(DashboardComponent)
