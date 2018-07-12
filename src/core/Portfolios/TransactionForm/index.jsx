/* eslint-disable no-unused-vars */

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
import InputAdornment from '@material-ui/core/InputAdornment'
import { withFormik } from 'formik'
import { addTransaction } from '../../../store/transactions/actions'

const styles = () => ({
  root: {
    display: 'inline'
  },
  input: {
    margin: '5px'
  }
})

const mapStateToProps = ({ transactions }) => {
  return { transactions }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleSave: (transaction) => { dispatch(addTransaction(transaction)) }
  }
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
      handleSave,
      handleSubmit,
      values,
      handleChange
    } = this.props
    return (
      <div className={classes.root}>
        <Button size="small" color="inherit" onClick={this.handleClickOpen}>
          New Transaction
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
                inputProps={{ 'aria-label': 'Source', required: true }}
                className={classes.input}
                value={values.source || ''}
                name="source"
                onChange={handleChange}
                autoFocus
              />
              <TextField
                label="Ticker"
                inputProps={{ 'aria-label': 'Ticker', required: true }}
                className={classes.input}
                value={values.ticker}
                name="ticker"
                onChange={handleChange}
              />
              <TextField
                label="Shares"
                inputProps={{ 'aria-label': 'Shares', required: true }}
                className={classes.input}
                value={values.shares}
                name="shares"
                onChange={handleChange}
              />
              <TextField
                type="number"
                label="Purchase Price"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { 'aria-label': 'Purchase Price', required: true }
                }}
                className={classes.input}
                value={values.price}
                name="price"
                onChange={handleChange}
              />
              <TextField
                type="date"
                label="Purchase date"
                inputProps={{ 'aria-label': 'Purchase date', required: true }}
                className={classes.input}
                value={values.date}
                name="date"
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose} color="primary">Close</Button>
              <Button type="submit" color="primary">Save</Button>
            </DialogActions>
          </form>
        </Dialog>
      </div>
    )
  }
}

TransactionDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSave: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
  withFormik({
    mapPropsToValues: (props) => {
      return {
        source: '',
        ticker: '',
        shares: '',
        price: '',
        date: ''
      }
    },
    handleSubmit: (values, { props, setSubmitting, resetForm }) => {
      setSubmitting(true)
      props.handleSave({
        source: values.source,
        ticker: values.ticker,
        shares: values.shares,
        price: values.price,
        date: values.date
      })
      resetForm()
      setSubmitting(false)
    }
  })
)(TransactionDialog)
