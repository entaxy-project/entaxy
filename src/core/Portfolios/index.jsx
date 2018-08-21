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
import FormLabel from '@material-ui/core/FormLabel'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Header from '../../common/Header/index'
import PortfolioTable from './PortfolioTable'
import AllocationPie from './AllocationPie'
import { updatePortfolioFilterValue } from '../../store/settings/actions'

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
    portfolioFilters: state.settings.portfolioFilters
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateFilter: (filterName, option, value) => dispatch(updatePortfolioFilterValue(filterName, option, value))
  }
}

const Portfolios = ({
  classes,
  portfolioFilters,
  updateFilter
}) => {
  const handleChange = (filterName, option) => (event) => {
    updateFilter(filterName, option, event.target.checked)
  }

  return (
    <div className={classes.root}>
      <Header />
      <Grid container spacing={0}>
        <Grid item xs={4}>
          <Paper className={classes.paper}>
            <AllocationPie />
          </Paper>
          <Paper className={classes.paper}>
            {_.map(portfolioFilters, (options, filterName) => {
              return (
                <div key={filterName}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Select {filterName}</FormLabel>
                    <FormGroup>
                      {_.map(options, (value, option) => {
                        return (
                          <FormControlLabel
                            key={option}
                            control={
                              <Checkbox
                                value={option}
                                checked={value}
                                onChange={handleChange(filterName, option)}
                              />
                            }
                            label={option}
                          />
                        )
                      })}
                    </FormGroup>
                  </FormControl>
                </div>
              )
            })}
          </Paper>
        </Grid>
        <Grid item xs={8}>
          <Paper className={classes.paper}>
            <Typography variant="headline" gutterBottom align="center">Portfolio</Typography>
            <PortfolioTable />
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

Portfolios.propTypes = {
  classes: PropTypes.object.isRequired,
  portfolioFilters: PropTypes.object.isRequired,
  updateFilter: PropTypes.func.isRequired
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles)
)(Portfolios)
