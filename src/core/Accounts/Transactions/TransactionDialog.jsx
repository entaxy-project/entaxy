import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { withFormik } from 'formik'
import * as Yup from 'yup'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import TextField from '@material-ui/core/TextField'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import InputAdornment from '@material-ui/core/InputAdornment'
import DescriptionIcon from '@material-ui/icons/Description'
import AttachMoneyIcon from '@material-ui/icons/AttachMoney'
import CalendarTodayIcon from '@material-ui/icons/CalendarToday'
import NoteIcon from '@material-ui/icons/Note'
import Autocomplete from '@material-ui/lab/Autocomplete'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import grey from '@material-ui/core/colors/grey'
import ModalDialog from '../../../common/ModalDialog'
import { createTransaction, updateTransaction } from '../../../store/transactions/actions'
import LinkTo from '../../../common/LinkTo'

const styles = (theme) => ({
  root: {
    minWidth: 900
  },
  input: {
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
    width: '100%'
  },
  inputIcon: {
    color: grey[600],
    fontSize: '1.1rem'
  },
  manageCategoriesLink: {
    color: theme.palette.info.text,
    float: 'right',
    paddingTop: 0,
    paddingBottom: 0,
    lineHeight: 'normal',
    textTransform: 'none'
  },
  institutionIcon: {
    verticalAlign: 'middle',
    marginRight: theme.spacing(1),
    width: 15,
    height: 15
  },
  accountName: {
    paddingLeft: theme.spacing(2)
  },
  categoryOption: {
    marginLeft: theme.spacing(1),
    marginRight: 8
  },
  categoryDot: {
    borderRadius: 4,
    content: '" "',
    display: 'inline-block',
    height: 15,
    width: 15,
    marginBottom: -2
  },
  categoryName: {
    display: 'inline-block',
    marginLeft: theme.spacing(1)
  },
  transferLabel: {
    marginTop: 6,
    marginBottom: -6
  }
})

const mapStateToProps = ({ budget, accounts }) => ({ budget, accounts })

const mapDispatchToProps = (dispatch) => {
  return {
    handleSave: (account, transaction, options) => {
      if ('id' in transaction) {
        return dispatch(updateTransaction(account, transaction, options))
      }
      return dispatch(createTransaction(account, transaction, options))
    }
  }
}

const TRANSACTION_TYPES = ['expense', 'income', 'transfer']

const getTransactioType = (transaction) => {
  if (transaction.transferAccountId) return 'transfer'
  return transaction.amount.accountCurrency < 0 ? 'expense' : 'income'
}

const getAmount = (values) => {
  if (values.transferAccountId) {
    return values.transferDirection === 'to' ? values.amount * -1 : values.amount
  }
  return values.transactionType === 'expense' ? values.amount * -1 : values.amount
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
  onDelete,
  open,
  account,
  transaction,
  budget,
  accounts
}) => (
  <ModalDialog
    open={open}
    title={transaction ? 'Edit transaction' : 'New transaction'}
    onSubmit={handleSubmit}
    onCancel={onCancel}
    onDelete={transaction ? onDelete : undefined}
    className={classes.root}
  >
    <Grid container>
      <Grid item xs={12}>
        <RadioGroup
          row={true}
          aria-label="transactionType"
          name="transactionType"
          value={values.transactionType}
          onChange={handleChange}
        >
          {TRANSACTION_TYPES.map((type) => (
            <FormControlLabel
              value={type}
              key={type}
              control={<Radio />}
              label={type.charAt(0).toUpperCase() + type.slice(1)}
            />
          ))}
        </RadioGroup>
        <TextField
          autoFocus
          label="Description"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><DescriptionIcon className={classes.inputIcon} /></InputAdornment>
            ),
            inputProps: {
              'aria-label': 'Description',
              maxLength: 150
            }
          }}
          className={classes.input}
          value={values.description}
          name="description"
          onChange={handleChange}
          error={errors.description && touched.description}
          helperText={errors.description}
        />
        <Grid container spacing={4}>
          <Grid item xs={6}>
            <TextField
              type="number"
              label="Amount"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><AttachMoneyIcon className={classes.inputIcon} /></InputAdornment>
                ),
                inputProps: {
                  'aria-label': 'Amount',
                  step: 0.01,
                  min: 0,
                  max: 999999999.99
                }
              }}
              className={classes.input}
              value={values.amount}
              name="amount"
              onChange={handleChange}
              error={errors.amount && touched.amount}
              helperText={errors.amount}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              type="date"
              label="Date"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarTodayIcon className={classes.inputIcon} />
                  </InputAdornment>
                )
              }}
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
        {values.transactionType !== 'transfer' && (
          <>
            <Autocomplete
              size="small"
              name="category"
              onChange={(_, item) => {
                setFieldValue('categoryId', item ? item.id : null)
                setFieldValue('category', item)
              }}
              className={classes.input}
              options={Object.values(budget.categoriesById).filter((category) => 'parentId' in category)}
              groupBy={(option) => budget.categoriesById[option.parentId].name}
              getOptionLabel={(option) => option.name}
              noOptionsText="No category found"
              value={values.category}
              renderOption={(option) => (
                <div className={classes.categoryOption}>
                  <div className={classes.categoryDot} style={{ backgroundColor: option.colour }} />
                  <div className={classes.categoryName}>{option.name}</div>
                </div>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Category"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: values.category && (
                      <InputAdornment position="start">
                        <div className={classes.categoryDot} style={{ backgroundColor: values.category.colour }} />
                      </InputAdornment>
                    )
                  }}
                />
              )}
            />
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Tooltip title="Apply category to all transactions with the same description">
                  <FormControlLabel
                    control={(
                      <Checkbox
                        checked={values.createAndApplyRule}
                        onChange={handleChange}
                        name="createAndApplyRule"
                        value={values.createAndApplyRule}
                      />
                    )}
                    label="Apply to all matches"
                  />
                </Tooltip>
              </Grid>
              <Grid item xs={4}>
                <Button
                  size="small"
                  color="secondary"
                  component={LinkTo('/budget-categories')}
                  className={classes.manageCategoriesLink}
                >
                  Manage categories
                </Button>
              </Grid>
            </Grid>
          </>
        )}
        {values.transactionType === 'transfer' && (
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <FormControl>
                <Typography variant="caption" className={classes.transferLabel}>Transfer</Typography>
                <RadioGroup
                  row={true}
                  aria-label="Transfer direction"
                  name="transferDirection"
                  value={values.transferDirection}
                  onChange={handleChange}
                >
                  <FormControlLabel value="from" control={<Radio />} label="From" />
                  <FormControlLabel value="to" control={<Radio />} label="To" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={8}>
              <Autocomplete
                autoHighlight
                autoSelect
                size="small"
                name="transferAccount"
                onChange={(_, item) => {
                  setFieldValue('transferAccountId', item ? item.id : null)
                  setFieldValue('transferAccount', item)
                }}
                className={classes.input}
                classes={{ option: classes.accountName }}
                options={Object.values(accounts.byId).filter((a) => account.id !== a.id)}
                groupBy={(option) => option.institution}
                getOptionLabel={(option) => option.name}
                noOptionsText="No accounts found"
                value={values.transferAccount}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Account"
                    fullWidth
                  />
                )}
              />
            </Grid>
          </Grid>
        )}
        <TextField
          type="notes"
          label="Notes"
          InputLabelProps={{
            shrink: true,
            'aria-label': 'Notes'
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><NoteIcon className={classes.inputIcon} /></InputAdornment>
            ),
            inputProps: {
              length: 2
            }
          }}
          name="notes"
          multiline
          rowsMax="4"
          className={classes.input}
          value={values.notes}
          onChange={handleChange}
          error={errors.notes && touched.notes}
          helperText={errors.notes}
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
  onDelete: PropTypes.func.isRequired,
  budget: PropTypes.object.isRequired,
  transaction: PropTypes.object,
  account: PropTypes.object.isRequired,
  accounts: PropTypes.object.isRequired
}

TransactionDialogComponent.defaultProps = {
  transaction: null
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
  withFormik({
    enableReinitialize: true,
    mapPropsToValues: ({ accounts, transaction, budget }) => {
      if (transaction === null) {
        return {
          transactionType: 'expense',
          description: '',
          categoryId: null,
          category: null,
          createAndApplyRule: true,
          amount: '',
          transferDirection: 'to',
          transferAccountId: null,
          transferAccount: null,
          notes: '',
          createdAt: format(Date.now(), 'yyyy-MM-dd')
        }
      }

      return {
        ...transaction,
        transactionType: getTransactioType(transaction),
        amount: Math.abs(transaction.amount.accountCurrency),
        createAndApplyRule: true,
        category: transaction.categoryId ? budget.categoriesById[transaction.categoryId] : null,
        notes: transaction.notes || '',
        transferDirection: transaction.transferDirection || 'to',
        transferAccount: transaction.transferAccountId ? accounts.byId[transaction.transferAccountId] : null,
        createdAt: format(new Date(transaction.createdAt), 'yyyy-MM-dd')
      }
    },
    validationSchema: Yup.object().shape({
      transactionType: Yup.string()
        .required('Please select the transaction type')
        .oneOf(TRANSACTION_TYPES),
      description: Yup.string()
        .required('Please enter a description for this transaction')
        .max(150, 'Too Long!'),
      categoryId: Yup.object()
        .nullable(),
      amount: Yup.number()
        .required('Please enter an amount')
        .min(0)
        .max(999999999.99),
      notes: Yup.string()
        .nullable()
        .max(256, 'Too Long!'),
      createdAt: Yup.date()
        .required('Please select the date of this transaction')
    }),
    handleSubmit: (values, { props, setSubmitting, resetForm }) => {
      console.log(values)
      setSubmitting(true)
      const { createAndApplyRule, ...rest } = values
      props.handleSave(
        props.account,
        {
          ...rest,
          amount: {
            accountCurrency: getAmount(values),
            localCurrency: null
          },
          categoryId: (!values.categoryId || values.transactionType === 'transfer' ? undefined : values.categoryId),
          transferAccountId: values.transactionType === 'transfer' ? values.transferAccountId : null,
          notes: values.notes ? values.notes.trim() : null,
          createdAt: parse(values.createdAt, 'yyyy-M-d', new Date()).getTime()
        },
        { createAndApplyRule }
      )
      resetForm()
      setSubmitting(false)
      props.onCancel()
    }
  })
)(TransactionDialogComponent)
