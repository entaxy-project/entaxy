/* eslint no-console: 0 */
import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'

const styles = () => ({
  root: {
    display: 'flex',
    'flex-direction': 'column',
    margin: '15px'
  },
  textField: {
    margin: '0px 20px 15px 0px'
  }
})

const CsvImportFields = ({
  classes,
  institution,
  values,
  handleChange
}) => {
  switch (institution) {
    case 'BMO':
      return (
        <div className={classes.root}>
          <Typography variant="body" gutterBottom={true}>
            Fill out the following field
          </Typography>
          <TextField
            label="Currency"
            inputProps={{
              'aria-label': 'Currency',
              required: true,
              maxLength: 6
            }}
            value={values.ticker}
            name="ticker"
            onChange={handleChange}
            className={classes.textField}
          />
        </div>
      )
    case 'TD':
    case 'Tangerine':
      return (
        <div className={classes.root}>
          <Typography variant="body" gutterBottom={true}>
            Fill out the following fields
          </Typography>
          <TextField
            label="Account"
            inputProps={{
              'aria-label': 'Account',
              required: true,
              maxLength: 100
            }}
            value={values.account}
            name="account"
            helperText="The name of the account (e.g. RRSP, TFSA, etc)"
            onChange={handleChange}
            className={classes.textField}
          />
          <TextField
            label="Currency"
            inputProps={{
              'aria-label': 'Currency',
              required: true,
              maxLength: 6
            }}
            value={values.ticker}
            name="ticker"
            onChange={handleChange}
            className={classes.textField}
          />
        </div>
      )
    default:
      return null
  }
}

CsvImportFields.propTypes = {
  institution: PropTypes.string.isRequired
}

export default withStyles(styles)(CsvImportFields)
