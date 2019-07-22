import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { withFormik } from 'formik'
import * as Yup from 'yup'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import chroma from 'chroma-js'
import AutoComplete from '../../../common/AutoComplete'
import ModalDialog from '../../../common/ModalDialog'
import { createTransaction, updateTransaction } from '../../../store/transactions/actions'

const styles = theme => ({
  root: {
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
// const mapStateToProps = ({ budget }) => ({
//   budget,
//   budgetForSelect: budget.tree.map(cat => ({
//     label: budget.byId[cat.id].label,
//     options: cat.children.map(subCat => budget.byId[subCat])
//   }))
// })

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
      name="category"
      value={values.category}
      options={budget.categories}
      onChange={setFieldValue}
      error={errors.category && touched.category}
      helperText={errors.category}
      styles={colourStyles}
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
          category: null,
          amount: '',
          createdAt: format(Date.now(), 'YYYY-MM-DD')
        }
      }
      return {
        ...transaction,
        category: transaction.category === undefined ? null : {
          label: transaction.category,
          value: transaction.category,
          colour: budget.colours[transaction.category]
        },
        createdAt: format(new Date(transaction.createdAt), 'YYYY-MM-DD')
      }
    },
    validationSchema: Yup.object().shape({
      description: Yup.string()
        .max(256, 'Too Long!'),
      category: Yup.object()
        .nullable(),
      amount: Yup.number()
        .required('Please enter an amount'),
      createdAt: Yup.date()
        .required('Please select the date of this transaction')
    }),
    handleSubmit: (values, { props, setSubmitting, resetForm }) => {
      setSubmitting(true)
      props.handleSave(props.account, {
        ...values,
        category: (values.category === null ? undefined : values.category.value),
        createdAt: parse(values.createdAt).getTime()
      })
      resetForm()
      setSubmitting(false)
      props.onCancel()
    }
  })
)(TransactionDialogComponent)
