import React from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import BudgetChart from './BudgetChart'

const useStyles = makeStyles((theme) => ({
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
}))

const BudgetIndex = () => {
  const classes = useStyles()
  const { budget } = useSelector((state) => ({ budget: state.budget }))

  const userHasBudget = Object.keys(budget.rules).length > 0
  return (
    <Container className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" className={classes.chartTitle}>
            Budget history
          </Typography>
          <Paper className={classes.budgetChart}>
            {!userHasBudget && (
              <Typography>
                Not enough data to generate chart
              </Typography>
            )}
            {userHasBudget && (
              <BudgetChart />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default BudgetIndex
