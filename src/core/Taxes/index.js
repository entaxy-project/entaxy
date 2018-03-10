import React from 'react'
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid'
import Paper from 'material-ui/Paper'
import Input, { InputLabel } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import { ParentSize } from "@vx/responsive";
import TaxChart from './TaxChart'
import CurrencyFormat from '../../common/CurrencyFormat'
import { calculateTotalTax, totalMarginalTax } from './TaxBrackets'
import Typography from 'material-ui/Typography';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    margin: '10px 5px',
    padding: '20px',
  },
})

class Taxes extends React.Component {

  constructor(props){
    super(props);
	  const income = 90000
	  const rrsp = 10000
	  const taxable_income = income - rrsp
	  const tax_amount = calculateTotalTax(2017, 'Ontario', taxable_income)

    this.state = {
      province: 'Ontario',
      income: income,
      rrsp: rrsp,
      taxable_income:  taxable_income,
      tax_amount: tax_amount,
      marginal_tax_rate: totalMarginalTax(2017, 'Ontario', taxable_income),
      average_tax_rate: tax_amount / (taxable_income)
    }
  }




  handleChange = name => event => {
    let income = name === 'income' ? event.target.value : this.state.income
    let rrsp = name === 'rrsp' ? event.target.value : this.state.rrsp
    let taxable_income = income - rrsp
    let tax_amount = calculateTotalTax(2017, this.state.province, taxable_income)
    this.setState({
      [name]: event.target.value,
      taxable_income: taxable_income,
      tax_amount: tax_amount,
      marginal_tax_rate: totalMarginalTax(2017, this.state.province, taxable_income),
      average_tax_rate: tax_amount / (income - rrsp)
    })
  }


  render() {
    const { classes } = this.props
    var currencyFormatter = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' })
    var percentFormatter = new Intl.NumberFormat('en-CA', {style: 'percent'})
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
                    'aria-label': 'Income for 2017',
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
                    'aria-label': 'RRSP for 2017',
                  }}
                />
              </FormControl>
            </Paper>
            <Paper className={classes.paper}>
              <Typography>
                <strong>Taxable income:</strong> {currencyFormatter.format(this.state.income - this.state.rrsp)}
              </Typography>
              <Typography>
                <strong>Tax amount:</strong> {currencyFormatter.format(this.state.tax_amount)}
              </Typography>
              <Typography>
                <strong>Marginal Tax Rate:</strong> {percentFormatter.format(this.state.marginal_tax_rate)}
              </Typography>
              <Typography>
                <strong>Average Tax Rate:</strong> {percentFormatter.format(this.state.average_tax_rate)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </div>
      )
    }
}

export default withStyles(styles)(Taxes);
