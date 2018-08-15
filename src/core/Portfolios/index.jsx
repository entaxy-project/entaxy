/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
import _ from 'lodash'
import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormGroup from '@material-ui/core/FormGroup'
import FormLabel from '@material-ui/core/FormLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Header from '../../common/Header/index'
import PortfolioTable from './PortfolioTable'
import AllocationPie from './AllocationPie'
import {
  portfolioTableSelector,
  portfolioPieChartSelector
} from '../../store/transactions/selectors'

const styles = () => ({
  root: {
    flexGrow: 1
  },
  paper: {
    margin: '10px 5px',
    padding: '20px'
  }
})


const mapStateToProps = (state) => {
  return {
    portfolioTableData: portfolioTableSelector(state),
    portfolioPieChartData: portfolioPieChartSelector(state)
  }
}

class Portfolios extends React.Component {
  constructor(props) {
    super(props)
    const portfolios = _.flatten([])

    const displayPortfolios = _.reduce(portfolios, (result, portfolio) => {
      result[portfolio.account.uuid] = true
      return result
    }, {})

    this.state = {
      portfolios,
      displayPortfolios
    }
  }

  handleChange = name => (event) => {
    const displayPortfolios = {
      ...this.state.displayPortfolios,
      [name]: event.target.checked
    }

    this.setState({
      displayPortfolios
    })
  }

  render() {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <Header />
        <Grid container spacing={0}>
          <Grid item xs={4}>
            <Paper className={classes.paper}>
              {AllocationPie(this.props.portfolioPieChartData, 400, 400)}
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
              <PortfolioTable portfolioTable={this.props.portfolioTableData} />
            </Paper>
          </Grid>
        </Grid>
      </div>
    )
  }
}

Portfolios.propTypes = {
  classes: PropTypes.object.isRequired,
  portfolioTableData: PropTypes.array.isRequired,
  portfolioPieChartData: PropTypes.array.isRequired
}

export default compose(
  connect(mapStateToProps),
  withStyles(styles)
)(Portfolios)
