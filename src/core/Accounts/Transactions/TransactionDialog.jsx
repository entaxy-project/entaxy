import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { withFormik } from 'formik'
import * as Yup from 'yup'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import TextField from '@material-ui/core/TextField'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import chroma from 'chroma-js'
import AutoComplete from '../../../common/AutoComplete'
import ModalDialog from '../../../common/ModalDialog'
import { createTransaction, updateTransaction } from '../../../store/transactions/actions'

const styles = theme => ({
  root: {
    minWidth: 600
  },
  input: {
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
    width: '100%'
  }
})

const dot = (color = '#ccc') => ({
  alignItems: 'center',
  display: 'flex',
  ':before': {
    backgroundColor: color,
    borderRadius: 4,
    content: '" "',
    display: 'block',
    marginRight: 8,
    height: 15,
    width: 15
  }
})

const colourStyles = {
  control: newStyles => ({ ...newStyles, backgroundColor: 'white' }),
  option: (newStyles, { data, isDisabled, isSelected }) => {
    const color = chroma(data.colour)
    return {
      ...newStyles,
      ...dot(data.colour),
      cursor: isDisabled ? 'not-allowed' : 'default',
      ':active': {
        ...newStyles[':active'],
        backgroundColor: !isDisabled && (isSelected ? data.colour : color.alpha(0.3).css())
      }
    }
  },
  input: newStyles => ({ ...newStyles, ...dot() }),
  placeholder: newStyles => ({ ...newStyles, ...dot() }),
  singleValue: (newStyles, { data }) => ({ ...newStyles, ...dot(data.colour) })
}

const mapStateToProps = ({ budget }) => ({ budget })

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

export const TransactionDialogComponent = ({
  classes,
  handleSubmit,
  setFieldValue,
  values,
  errors,
  touched,
  handleChange,
  onCancel,
  open,
  transaction,
  budget
}) => (
  <ModalDialog
    open={open}
    title={transaction ? 'Edit transaction' : 'New transaction'}
    onSubmit={handleSubmit}
    onCancel={onCancel}
    className={classes.root}
  >
    <Grid container>
      <Grid item xs={12}>
        <TextField
          label="Description"
          inputProps={{
            'aria-label': 'Description',
            maxLength: 256
          }}
          className={classes.input}
          value={values.description}
          name="description"
          onChange={handleChange}
          error={errors.description && touched.description}
          helperText={errors.description}
        />
        <AutoComplete
          className={classes.input}
          label="Category"
          name="categoryId"
          value={values.categoryId}
          options={budget.categoryTree}
          onChange={setFieldValue}
          error={errors.categoryId && touched.categoryId}
          helperText={errors.categoryId}
          styles={colourStyles}
        />
        <FormControlLabel
          control={(
            <Checkbox
              checked={values.applyCategoryToAllMatchingTransactions}
              onChange={handleChange}
              name="applyCategoryToAllMatchingTransactions"
              value={values.applyCategoryToAllMatchingTransactions}
            />
          )}
          label="Apply to all matching transactions"
        />
        <TextField
          type="number"
          label="Amount"
          inputProps={{
            'aria-label': 'Amount',
            maxLength: 10,
            min: Number.MIN_SAFE_INTEGER,
            max: Number.MAX_SAFE_INTEGER,
            step: 0.01
          }}
          className={classes.input}
          value={values.amount}
          name="amount"
          onChange={handleChange}
          error={errors.amount && touched.amount}
          helperText={errors.amount}
        />
        <TextField
          type="date"
          label="Date"
          InputLabelProps={{
            shrink: true,
            'aria-label': 'Date'
          }}
          name="createdAt"
          className={classes.input}
          value={values.createdAt}
          onChange={handleChange}
          error={errors.createdAt && touched.createdAt}
          helperText={errors.createdAt}
        />
      </Grid>
    </Grid>
  </ModalDialog>
)

TransactionDialogComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  touched: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  budget: PropTypes.object.isRequired,
  transaction: PropTypes.object
}

TransactionDialogComponent.defaultProps = {
  transaction: null
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
  withFormik({
    enableReinitialize: true,
    mapPropsToValues: ({ transaction, budget }) => {
      if (transaction === null) {
        return {
          description: '',
          categoryId: null,
          applyCategoryToAllMatchingTransactions: true,
          amount: '',
          createdAt: format(Date.now(), 'YYYY-MM-DD')
        }
      }
      return {
        ...transaction,
        applyCategoryToAllMatchingTransactions: true,
        categoryId: transaction.categoryId === undefined ? null : {
          id: budget.categoriesById[transaction.categoryId].id,
          label: budget.categoriesById[transaction.categoryId].name,
          value: budget.categoriesById[transaction.categoryId].name,
          colour: budget.categoriesById[transaction.categoryId].colour
        },
        createdAt: format(new Date(transaction.createdAt), 'YYYY-MM-DD')
      }
    },
    validationSchema: Yup.object().shape({
      description: Yup.string()
        .max(256, 'Too Long!'),
      categoryId: Yup.object()
        .nullable(),
      amount: Yup.number()
        .required('Please enter an amount'),
      createdAt: Yup.date()
        .required('Please select the date of this transaction')
    }),
    handleSubmit: (values, { props, setSubmitting, resetForm }) => {
      setSubmitting(true)
      const { applyCategoryToAllMatchingTransactions, ...rest } = values
      props.handleSave(props.account, {
        ...rest,
        categoryId: (rest.categoryId === null ? undefined : rest.categoryId.id),
        createdAt: parse(rest.createdAt).getTime()
      })
      resetForm()
      setSubmitting(false)
      props.onCancel()
    }
  })
)(TransactionDialogComponent)
