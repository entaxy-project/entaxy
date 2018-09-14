/* eslint no-console: 0 */
import React from 'react'
import { compose } from 'recompose'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import InputAdornment from '@material-ui/core/InputAdornment'
import AddIcon from '@material-ui/icons/Add'

import DateFnsUtils from 'material-ui-pickers/utils/date-fns-utils'
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider'
import DateTimePicker from 'material-ui-pickers/DateTimePicker'

import { withFormik } from 'formik'
import { createTransaction } from '../../../store/transactions/actions'

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
    handleSave: (transaction) => { dispatch(createTransaction(transaction)) }
  }
}

class MyDateSelect extends React.Component {
  handleChange = (value) => {
    // this is going to call setFieldValue and manually update values.createdAt
    this.props.onChange('createdAt', value)
  }

  render() {
    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <DateTimePicker
          label="Date"
          inputProps={{ 'aria-label': 'Date', required: true }}
          value={this.props.value}
          name="createdAt"
          onChange={this.handleChange}
        />
      </MuiPickersUtilsProvider>
    )
  }
}

MyDateSelect.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}

class TransactionDialog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false
    }
  }

  handleClickOpen = () => {
    this.setState({ open: true })
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  render() {
    const {
      classes,
      handleSubmit,
      values,
      handleChange,
      setFieldValue
    } = this.props
    return (
      <div className={classes.root}>
        <Button
          variant="fab"
          color="primary"
          aria-label="New Transaction"
          onClick={this.handleClickOpen}
        >
          <AddIcon />
        </Button>
        <Dialog
          aria-labelledby="form-dialog-title"
          open={this.state.open}
          onClose={this.handleClose}
        >
          <DialogTitle id="form-dialog-title">Add new transaction</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <TextField
                label="Source"
                inputProps={{
                  'aria-label': 'Source',
                  required: true,
                  maxLength: 100
                }}
                className={classes.input}
                value={values.source || ''}
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
                value={values.account || ''}
                name="account"
                helperText="The name of the account (e.g. RRSP, TFSA, etc"
                onChange={handleChange}
              />
              <TextField
                select
                label="Purchase Type"
                inputProps={{ 'aria-label': 'Purchase Type', required: true }}
                className={classes.input}
                value={values.type || ''}
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
                  max: 9999999999
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
                    max: 999999
                  }
                }}
                className={classes.input}
                value={values.bookValue}
                name="bookValue"
                helperText="The original purchase cost"
                onChange={handleChange}
              />
              <MyDateSelect
                value={values.createdAt}
                onChange={setFieldValue}
              />
            </DialogContent>
            <DialogActions>
              <Button type="submit" color="primary">Save</Button>
              <Button onClick={this.handleClose} color="primary">Close</Button>
            </DialogActions>
          </form>
        </Dialog>
      </div>
    )
  }
}

TransactionDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired
}

export default compose(
  connect(null, mapDispatchToProps),
  withStyles(styles),
  withFormik({
    mapPropsToValues: () => {
      return {
        source: '',
        account: '',
        type: '',
        ticker: '',
        shares: '',
        bookValue: '',
        createdAt: new Date()
      }
    },
    handleSubmit: (values, { props, setSubmitting, resetForm }) => {
      setSubmitting(true)
      props.handleSave({
        source: values.source,
        account: values.account,
        type: values.type,
        ticker: values.ticker,
        shares: values.shares,
        bookValue: values.bookValue,
        createdAt: values.createdAt
      })
      resetForm()
      setSubmitting(false)
    }
  })
)(TransactionDialog)
