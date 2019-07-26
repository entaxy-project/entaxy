import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import BudgetChart from './BudgetChart'

const styles = theme => ({
  root: {
    padding: theme.spacing(2)
  },
  budgetChart: {
    padding: theme.spacing(2),
    height: 400,
    minWidth: 200
  },
  chartTitle: {
    padding: theme.spacing(1)
  }
})

const mapStateToProps = state => ({
  budget: state.budget
})

export const DashboardComponent = ({
  classes,
  budget
}) => {
  const userHasBudget = Object.keys(budget.rules).length > 0
  return (
    <Container className={classes.root}>
      {userHasBudget && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" className={classes.chartTitle}>Budget history</Typography>
            <Paper className={classes.budgetChart}>
              <BudgetChart />
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  )
}

DashboardComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  budget: PropTypes.object.isRequired
}

export default compose(
  connect(mapStateToProps),
  withStyles(styles)
)(DashboardComponent)
