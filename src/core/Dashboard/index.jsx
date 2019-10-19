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
import { currencyFormatter } from '../../util/stringFormatter'
import LinkTo from '../../common/LinkTo'
import AccountsTable from './AccountsTable'

const styles = (theme) => ({
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
  noAccountsPaper: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    textAlign: 'center'
  },
  newAccountButton: {
    margin: theme.spacing(3)
  }
})

const mapStateToProps = (state) => ({
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
  totalBalance
}) => {
  const formatCurrency = (currency, value) => (
    currencyFormatter(settings.locale, currency)(value)
  )

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
              <Grid item xs={12} md={6}>
                <AccountsTable filter="Assets" />
              </Grid>
              <Grid item xs={12} md={6}>
                <AccountsTable filter="Liabilities" />
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
  totalBalance: PropTypes.number.isRequired
}

export default compose(
  connect(mapStateToProps),
  withStyles(styles)
)(DashboardComponent)
