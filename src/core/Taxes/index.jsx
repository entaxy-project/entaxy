import React from 'react'
import { withStyles } from 'material-ui/styles'
import Grid from 'material-ui/Grid'
import Paper from 'material-ui/Paper'
import Input, { InputLabel } from 'material-ui/Input'
import { FormControl } from 'material-ui/Form'
import { ParentSize } from '@vx/responsive'
import TaxChart from './TaxChart'
import CurrencyFormat from '../../common/CurrencyFormat/index'
import { calculateTotalTax, totalMarginalTax } from './lib/TaxBrackets'
import Typography from 'material-ui/Typography'

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    margin: '10px 5px',
    padding: '20px'
  }
})

class Taxes extends React.Component {
  constructor(props) {
    super(props)
    const income = 90000
    const rrsp = 10000
    const taxableIncome = income - rrsp
    const taxAmount = calculateTotalTax(2017, 'Ontario', taxableIncome)

    this.state = {
      province: 'Ontario',
      income,
      rrsp,
      taxableIncome,
      taxAmount,
      marginalTaxRate: totalMarginalTax(2017, 'Ontario', taxableIncome),
      averageTaxRate: taxAmount / (taxableIncome)
    }
  }

  handleChange = name => (event) => {
    const income = name === 'income' ? event.target.value : this.state.income
    const rrsp = name === 'rrsp' ? event.target.value : this.state.rrsp
    const taxableIncome = income - rrsp
    const taxAmount = calculateTotalTax(2017, this.state.province, taxableIncome)
    this.setState({
      [name]: event.target.value,
      taxableIncome,
      taxAmount,
      marginalTaxRate: totalMarginalTax(2017, this.state.province, taxableIncome),
      averageTaxRate: taxAmount / (income - rrsp)
    })
  }

  render() {
    const { classes } = this.props
    const currencyFormatter = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' })
    const percentFormatter = new Intl.NumberFormat('en-CA', { style: 'percent', minimumFractionDigits: 2 })
    return (
      <div className={classes.root}>
        <Grid container spacing={0}>
          <Grid item xs={10}>
            <Paper className={classes.paper}>
              <Typography variant="headline" gutterBottom align="center">
                Taxes for 2017
              </Typography>
              <ParentSize>
                {parent => (
                  <TaxChart
                    year={2017}
                    width={parent.width}
                    height={500}
                    income={this.state.income}
                    rrsp={this.state.rrsp}
                    taxAmount={this.state.taxAmount}
                  />)
                }
              </ParentSize>
            </Paper>
          </Grid>
          <Grid item xs={2}>
            <Paper className={classes.paper}>
              <FormControl fullWidth className={classes.formControl}>
                <InputLabel htmlFor="income">Your income</InputLabel>
                <Input
                  value={this.state.income}
                  onChange={this.handleChange('income')}
                  inputComponent={CurrencyFormat}
                  className={classes.input}
                  inputProps={{
                    'aria-label': 'Income for 2017'
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
                  value={this.state.rrsp}
                  onChange={this.handleChange('rrsp')}
                  inputComponent={CurrencyFormat}
                  className={classes.rrsp}
                  inputProps={{
                    'aria-label': 'RRSP for 2017'
                  }}
                />
              </FormControl>
            </Paper>
            <Paper className={classes.paper}>
              <Typography>
                <strong>Taxable income:</strong> {currencyFormatter.format(this.state.income - this.state.rrsp)}
              </Typography>
              <Typography>
                <strong>Tax amount:</strong> {currencyFormatter.format(this.state.taxAmount)}
              </Typography>
              <Typography>
                <strong>Marginal Tax Rate:</strong> {percentFormatter.format(this.state.marginalTaxRate)}
              </Typography>
              <Typography>
                <strong>Average Tax Rate:</strong> {percentFormatter.format(this.state.averageTaxRate)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(styles)(Taxes)
