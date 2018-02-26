import React from 'react'
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid'
import Paper from 'material-ui/Paper'
import Input, { InputLabel } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import { ParentSize } from "@vx/responsive";
import TaxChart from './TaxChart'
import CurrencyFormat from '../../common/CurrencyFormat'
import { calculateTotalTax } from './TaxBrackets'
import Typography from 'material-ui/Typography';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    margin: '10px 5px',
    padding: '10px',
  },
})

class Taxes extends React.Component {
	state = {
    income: '90000',
    rrsp: '10000',
    tax: calculateTotalTax(2017, 'Ontario', 90000 - 10000),
  }

	handleChange = name => event => {
		var income = name == 'income' ? event.target.value : this.state.income
		var rrsp = name == 'rrsp' ? event.target.value : this.state.rrsp
    this.setState({
    	[name]: event.target.value,
    	tax: calculateTotalTax(2017, 'Ontario', income - rrsp),
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
			          <InputLabel htmlFor="income">Your income for 2017</InputLabel>
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
							<FormControl fullWidth className={classes.formControl}>
			          <InputLabel htmlFor="rrsp">RRSP contribution for 2017</InputLabel>
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
		    			<Typography component="p">
			    			Tax amount: {currencyFormatter.format(this.state.tax)}
          		</Typography>
          		<Typography component="p">
			    			Marginal Tax: {percentFormatter.format(this.state.tax / (this.state.income - this.state.rrsp))}
          		</Typography>
		    		</Paper>
					</Grid>
				</Grid>
			</div>
			)
  	}
}

export default withStyles(styles)(Taxes);
