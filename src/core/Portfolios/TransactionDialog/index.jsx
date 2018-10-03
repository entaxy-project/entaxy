/* eslint no-console: 0 */
import React from 'react'
import { compose } from 'recompose'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import InputAdornment from '@material-ui/core/InputAdornment'
import { withFormik } from 'formik'
import ModalDialog from '../../../common/ModalDialog'
import DateTimeSelect from '../../../common/DateTimeSelect'
import { createTransaction, updateTransaction } from '../../../store/transactions/actions'

const styles = () => ({
  root: {
    display: 'inline'
  },
  input: {
    margin: '5px',
    width: 200
  }
})

const mapDispatchToProps = (dispatch) => {
  return {
    handleSave: (transaction) => {
      if ('id' in transaction) {
        return dispatch(updateTransaction(transaction))
      }
      return dispatch(createTransaction(transaction))
    }
  }
}

const TransactionDialog = ({
  classes,
  handleSubmit,
  values,
  handleChange,
  setFieldValue,
  onCancel,
  open
}) => (
  <div className={classes.root}>
    <ModalDialog
      open={open}
      title="Add new transaction"
      onSubmit={handleSubmit}
      onCancel={onCancel}
    >
      <div>
        <TextField
          label="Source"
          inputProps={{
            'aria-label': 'Source',
            required: true,
            maxLength: 100
          }}
          className={classes.input}
          value={values.source}
          name="source"
          helperText="This institution where this asset is being held"
          onChange={handleChange}
          autoFocus
        />
        <TextField
          label="Account"
          inputProps={{
            'aria-label': 'Account',
            required: true,
            maxLength: 100
          }}
          className={classes.input}
          value={values.account}
          name="account"
          helperText="The name of the account (e.g. RRSP, TFSA, etc)"
          onChange={handleChange}
        />
        <TextField
          select
          label="Purchase Type"
          inputProps={{ 'aria-label': 'Purchase Type', required: true }}
          className={classes.input}
          value={values.type}
          name="type"
          onChange={handleChange}
        >
          <MenuItem key="buy" value="buy">Buy</MenuItem>
          <MenuItem key="sell" value="sell">Sell</MenuItem>
        </TextField>
        <TextField
          label="Ticker"
          inputProps={{
            'aria-label': 'Ticker',
            required: true,
            maxLength: 6
          }}
          className={classes.input}
          value={values.ticker}
          name="ticker"
          onChange={handleChange}
        />
        <TextField
          type="number"
          label="Shares"
          inputProps={{
            'aria-label': 'Shares',
            required: true,
            maxLength: 10,
            min: 0,
            max: Number.MAX_SAFE_INTEGER
          }}
          className={classes.input}
          value={values.shares}
          name="shares"
          onChange={handleChange}
        />
        <TextField
          type="number"
          label="Book Value"
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
            inputProps: {
              'aria-label': 'Book Value',
              required: true,
              maxLength: 6,
              min: 0,
              max: Number.MAX_SAFE_INTEGER
            }
          }}
          className={classes.input}
          value={values.bookValue}
          name="bookValue"
          helperText="The original purchase cost"
          onChange={handleChange}
        />
        <DateTimeSelect
          label="Date"
          name="createdAt"
          value={values.createdAt}
          onChange={setFieldValue}
        />
      </div>
    </ModalDialog>
  </div>
)


TransactionDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired
}

export default compose(
  connect(null, mapDispatchToProps),
  withStyles(styles),
  withFormik({
    enableReinitialize: true,
    mapPropsToValues: ({ transaction }) => {
      if (transaction === null) {
        return {
          source: '',
          account: '',
          type: '',
          ticker: '',
          shares: '',
          bookValue: '',
          createdAt: new Date()
        }
      }
      return { ...transaction, createdAt: new Date(transaction.createdAt) }
    },
    handleSubmit: (values, { props, setSubmitting, resetForm }) => {
      setSubmitting(true)
      props.handleSave({
        ...props.transaction,
        ...values
      })
      resetForm()
      setSubmitting(false)
      props.onCancel()
    }
  })
)(TransactionDialog)
