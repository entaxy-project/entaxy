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
      handleChange
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
                inputProps={{ 'aria-label': 'Source', required: true }}
                className={classes.input}
                value={values.source || ''}
                name="source"
                helperText="This institution where this asset is being held"
                onChange={handleChange}
                autoFocus
              />
              <TextField
                label="Account"
                inputProps={{ 'aria-label': 'Account', required: true }}
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
                inputProps={{ 'aria-label': 'Ticker', required: true }}
                className={classes.input}
                value={values.ticker}
                name="ticker"
                onChange={handleChange}
              />
              <TextField
                type="number"
                label="Shares"
                inputProps={{ 'aria-label': 'Shares', required: true }}
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
                  inputProps: { 'aria-label': 'Book Value', required: true }
                }}
                className={classes.input}
                value={values.bookValue}
                name="bookValue"
                helperText="The original purchase cost"
                onChange={handleChange}
              />
              <TextField
                type="date"
                label="Date"
                inputProps={{ 'aria-label': 'Date', required: true }}
                className={classes.input}
                value={values.created_at}
                name="created_at"
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
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
  handleChange: PropTypes.func.isRequired
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
        created_at: ''
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
        created_at: values.created_at
      })
      resetForm()
      setSubmitting(false)
    }
  })
)(TransactionDialog)
