import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import Grid from 'material-ui/Grid'
import Paper from 'material-ui/Paper'
import Input, { InputLabel } from 'material-ui/Input'
import { FormControl } from 'material-ui/Form'
import Typography from 'material-ui/Typography'
import TaxChart from './TaxChart'
import CurrencyFormat from '../../common/CurrencyFormat/index'
import { calculateTotalTax, totalMarginalTax } from './lib/TaxBrackets'

const styles = () => ({
  root: {
    flexGrow: 1
  },
  paper: {
    margin: '10px 5px',
    padding: '20px'
  },
  chart: {
    height: '500px'
  }
})

class Taxes extends React.Component {
  constructor(props) {
    super(props)
    const country = 'Canada'
    const year = 2017
    const region = 'Ontario'
    const income = 90000
    const rrsp = 10000
    const taxableIncome = income - rrsp
    const taxAmount = calculateTotalTax(country, year, region, taxableIncome)

    this.state = {
      country,
      year,
      region,
      income,
      rrsp,
      taxableIncome,
      taxAmount,
      marginalTaxRate: totalMarginalTax(country, year, region, taxableIncome),
      averageTaxRate: taxAmount / (taxableIncome)
    }
  }

  handleChange = name => (event) => {
    const income = name === 'income' ? parseFloat(event.target.value) : this.state.income
    const rrsp = name === 'rrsp' ? parseFloat(event.target.value) : this.state.rrsp
    const taxableIncome = income - rrsp
    const { country, year, region } = this.state
    const taxAmount = calculateTotalTax(country, year, region, taxableIncome)
    this.setState({
      [name]: parseFloat(event.target.value),
      taxableIncome,
      taxAmount,
      marginalTaxRate: totalMarginalTax(country, year, region, taxableIncome),
      averageTaxRate: taxAmount / (income - rrsp)
    })
  }

  render() {
    const { classes } = this.props
    const {
      country,
      year,
      region,
      income,
      rrsp,
      taxAmount,
      taxableIncome,
      marginalTaxRate,
      averageTaxRate
    } = this.state
    const currencyFormatter = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' })
    const percentFormatter = new Intl.NumberFormat('en-CA', { style: 'percent', minimumFractionDigits: 2 })
    return (
      <div className={classes.root}>
        <Grid container spacing={0}>
          <Grid item xs={10}>
            <Paper className={`${classes.paper} ${classes.chart}`}>
              <Typography variant="headline" gutterBottom align="center">
                Taxes for {region} {year}
              </Typography>
              <TaxChart
                country={country}
                year={year}
                region={region}
                income={income}
                rrsp={rrsp}
                taxAmount={taxAmount}
              />
            </Paper>
          </Grid>
          <Grid item xs={2}>
            <Paper className={classes.paper}>
              <FormControl fullWidth className={classes.formControl}>
                <InputLabel htmlFor="income">Your income</InputLabel>
                <Input
                  value={income}
                  onChange={this.handleChange('income')}
                  inputComponent={CurrencyFormat}
                  className={classes.input}
                  inputProps={{
                    'aria-label': `Your income for ${year}`
                  }}
                />
              </FormControl>
            </Paper>
            <Paper className={classes.paper}>
              <Typography variant="subheading">
                Tax credits
              </Typography>
              <FormControl fullWidth className={classes.formControl}>
                <InputLabel htmlFor="rrsp">RRSP contribution</InputLabel>
                <Input
                  value={rrsp}
                  onChange={this.handleChange('rrsp')}
                  inputComponent={CurrencyFormat}
                  className={classes.rrsp}
                  inputProps={{
                    'aria-label': `RRSP for ${year}`
                  }}
                />
              </FormControl>
            </Paper>
            <Paper className={classes.paper}>
              <Typography>
                <strong>Taxable income:</strong> {currencyFormatter.format(taxableIncome)}
              </Typography>
              <Typography>
                <strong>Tax amount:</strong> {currencyFormatter.format(taxAmount)}
              </Typography>
              <Typography>
                <strong>Marginal Tax Rate:</strong> {percentFormatter.format(marginalTaxRate)}
              </Typography>
              <Typography>
                <strong>Average Tax Rate:</strong> {percentFormatter.format(averageTaxRate)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </div>
    )
  }
}

Taxes.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Taxes)
