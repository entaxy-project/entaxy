import React from 'react'
import { compose } from 'recompose'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import TextField from '@material-ui/core/TextField'
import { withFormik } from 'formik'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import ModalDialog from '../../../common/ModalDialog'
import { createTransaction, updateTransaction } from '../../../store/transactions/actions'

const styles = () => ({
  root: {
  },
  input: {
    margin: 5,
    width: '100%'
  }
})

const mapDispatchToProps = (dispatch) => {
  return {
    handleSave: (account, transaction) => {
      if ('id' in transaction) {
        return dispatch(updateTransaction(account, transaction))
      }
      return dispatch(createTransaction(account, transaction))
    }
  }
}

const TransactionDialog = ({
  classes,
  handleSubmit,
  values,
  handleChange,
  onCancel,
  open,
  transaction
}) => (
  <ModalDialog
    open={open}
    title={transaction ? 'Edit transaction' : 'New transaction'}
    onSubmit={handleSubmit}
    onCancel={onCancel}
    className={classes.root}
  >
    <TextField
      label="Description"
      inputProps={{
        'aria-label': 'Description',
        required: true,
        maxLength: 256
      }}
      className={classes.input}
      value={values.description}
      name="description"
      onChange={handleChange}
    />
    <TextField
      type="number"
      label="Amount"
      inputProps={{
        'aria-label': 'Amount',
        required: true,
        maxLength: 10,
        min: Number.MIN_SAFE_INTEGER,
        max: Number.MAX_SAFE_INTEGER,
        step: 0.01
      }}
      className={classes.input}
      value={values.amount}
      name="amount"
      onChange={handleChange}
    />
    <TextField
      type="date"
      label="Date"
      InputLabelProps={{
        shrink: true,
        'aria-label': 'Date',
        required: true
      }}
      name="createdAt"
      className={classes.input}
      value={values.createdAt}
      onChange={handleChange}
    />
  </ModalDialog>
)

TransactionDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  transaction: PropTypes.object
}

TransactionDialog.defaultProps = {
  transaction: null
}

export default compose(
  connect(null, mapDispatchToProps),
  withStyles(styles),
  withFormik({
    enableReinitialize: true,
    mapPropsToValues: ({ transaction }) => {
      if (transaction === null) {
        return {
          amount: '',
          bookValue: '',
          createdAt: format(Date.now(), 'YYYY-MM-DD')
        }
      }
      return {
        ...transaction,
        createdAt: format(new Date(transaction.createdAt), 'YYYY-MM-DD')
      }
    },
    handleSubmit: (values, { props, setSubmitting, resetForm }) => {
      setSubmitting(true)
      props.handleSave(props.account, {
        ...values,
        accountId: props.account.id,
        createdAt: parse(values.createdAt).getTime()
      })
      resetForm()
      setSubmitting(false)
      props.onCancel()
    }
  })
)(TransactionDialog)
