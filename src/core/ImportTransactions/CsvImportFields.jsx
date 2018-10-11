/* eslint no-console: 0 */
import React from 'react'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'

const CsvImportFields = ({ institution, values, handleChange }) => {
  switch (institution) {
    case 'BMO':
      return (
        <div>
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
          />
        </div>
      )
    case 'TD':
    case 'Tangerine':
      return (
        <div>
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

export default CsvImportFields
