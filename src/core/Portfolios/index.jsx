import React from 'react'
import { withStyles } from 'material-ui/styles'
import Grid from 'material-ui/Grid'
import Paper from 'material-ui/Paper'
import Typography from 'material-ui/Typography'
import _ from 'lodash'
import qtPortfolio from './portfolios/qt.json'
import rbcdiPortfolio from './portfolios/rbcdi.json'

import { FormControl, FormControlLabel, FormGroup, FormLabel } from 'material-ui/Form'
import Checkbox from 'material-ui/Checkbox'

import PortfolioTable from './PortfolioTable'
import { preparePieChartDataFromPortfolioTable, prepareTableDataForSelectedPortfolios } from './lib/util'
import Pie from './Pie'

const styles = () => ({
  root: {
    flexGrow: 1
  },
  paper: {
    margin: '10px 5px',
    padding: '20px'
  }
})

class Portfolios extends React.Component {
  constructor (props) {
    super(props)

    const portfolios = _.flatten([
      qtPortfolio,
      rbcdiPortfolio
    ])

    const displayPortfolios = _.reduce(portfolios, (result, portfolio) => {
      result[portfolio.account.uuid] = true
      return result
    }, {})

    const portfolioTable = prepareTableDataForSelectedPortfolios(displayPortfolios, portfolios)
    const pieData = preparePieChartDataFromPortfolioTable(portfolioTable)
    this.state = {
      portfolios,
      displayPortfolios,
      portfolioTable,
      pieData
    }
  }

  handleChange = name => (event) => {
    const displayPortfolios = {
      ...this.state.displayPortfolios,
      [name]: event.target.checked
    }

    const portfolioTable = prepareTableDataForSelectedPortfolios(displayPortfolios, this.state.portfolios)
    const pieData = preparePieChartDataFromPortfolioTable(portfolioTable)

    this.setState({
      displayPortfolios,
      portfolioTable,
      pieData
    })
  }

  render () {
    const {classes} = this.props

    return (
      <div className={classes.root}>
        <Grid container spacing={0}>
          <Grid item xs={4}>
            <Paper className={classes.paper}>
              {Pie(this.state.pieData, 400, 400)}
            </Paper>
            <Paper className={classes.paper}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Select Accounts</FormLabel>
                <FormGroup>
                  {_.map(this.state.portfolios, ((portfolio) => {
                    return (
                      <FormControlLabel
                        key={portfolio.uuid}
                        control={
                          <Checkbox
                            checked={this.state.displayPortfolios[portfolio.account.uuid]}
                            onChange={this.handleChange(portfolio.account.uuid)}
                            value={portfolio.account.uuid}
                          />
                        }
                        label={`${portfolio.account.institution} - ${portfolio.account.number}`}
                      />
                    )
                  }))}
                </FormGroup>
              </FormControl>
            </Paper>
          </Grid>
          <Grid item xs={8}>
            <Paper className={classes.paper}>
              <Typography variant="headline" gutterBottom align="center">Portfolio</Typography>
              {PortfolioTable(classes, this.state.portfolioTable)}
            </Paper>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(styles)(Portfolios)
