import React, { useState, useMemo, useEffect } from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import { withFormik } from 'formik'
import * as Yup from 'yup'
import PropTypes from 'prop-types'
import InputLabel from '@material-ui/core/InputLabel'
import Grid from '@material-ui/core/Grid'
import FormGroup from '@material-ui/core/FormGroup'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import TextField from '@material-ui/core/TextField'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import Button from '@material-ui/core/Button'
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
import LinkTo from '../../../common/LinkTo'
import RuleFields from './RuleFields'
import { transactionMatches } from '../../../store/budget/actions'
import TransactionsTable from './TransactionsTable'

const useStyles = makeStyles((theme) => ({
  input: {
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
    width: '100%'
  },
  inputIcon: {
    color: grey[600],
    fontSize: '1.1rem'
  },
  categoryDropdown: {
    marginTop: 11
  },
  transferFields: {
    flexWrap: 'nowrap',
    marginTop: 3
  },
  inlineSelect: {
    marginRight: theme.spacing(2),
    marginTop: 5,
    minWidth: 80
  },
  manageCategoriesLink: {
    color: theme.palette.info.text,
    float: 'right',
    paddingTop: 0,
    paddingBottom: 0,
    lineHeight: 'normal',
    textTransform: 'none'
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
  tableWrapper: {
    height: '100%'
  }
}))

const mapStateToProps = ({ budget, accounts, transactions }, ownProps) => ({
  budget,
  accounts,
  transactions: transactions.list.filter((transaction) => (
    transaction.accountId === ownProps.account.id
  ))
})

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

const getRuleFilters = (values) => {
  const filterText = values.ruleType === 'equals' ? values.description : values.filterText
  const filterBy = {}
  if (filterText) {
    filterBy.description = { type: values.ruleType, value: filterText }
  }
  if (values.matchAmount && values.amount) {
    filterBy.amount = { type: 'equals', value: getAmount(values) }
  }
  return filterBy
}

const getRule = (values, accountId) => {
  if (!values.applyToOtherTransactions) return null

  const attributes = {}
  if (values.transactionType === 'transfer' && values.transferAccountId) {
    attributes.transfer = {
      accountId: values.transferAccountId,
      direction: values.transferDirection
    }
  } else if (values.categoryId) {
    attributes.categoryId = values.categoryId
  }
  return { accountId, filterBy: getRuleFilters(values), attributes }
}

export const TransactionDialogComponent = ({
  handleSubmit,
  isSubmitting,
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
  accounts,
  transactions
}) => {
  const classes = useStyles()
  const [showTransactions, setShowTransactions] = useState(false)

  const toggleShowTransactions = () => {
    setShowTransactions((prevState) => !prevState)
  }

  const filteredTransactions = useMemo(() => {
    const filters = getRuleFilters(values)
    return transactions.filter((trans) => {
      if (transaction && transaction.id === trans.id) return false
      return transactionMatches(trans, account.id, filters)
    })
  }, [values, account, transaction, transactions])

  useEffect(() => {
    if (open) setShowTransactions(false)
  }, [open])

  return (
    <ModalDialog
      open={open}
      title={transaction ? 'Edit transaction' : 'New transaction'}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      onCancel={onCancel}
      onDelete={transaction ? onDelete : undefined}
      className={classes.root}
      maxWidth={showTransactions ? 'lg' : 'sm'}
      fullWidth
    >
      <Grid container spacing={2}>
        <Grid item md>
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
          <Grid container spacing={2}>
            <Grid item sm={4} xs={12}>
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
              <TextField
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
            <Grid item sm={8} xs={12}>
              {values.transactionType !== 'transfer' && (
                <Autocomplete
                  size="small"
                  name="category"
                  onChange={(_, item) => {
                    setFieldValue('categoryId', item ? item.id : null)
                    setFieldValue('category', item)
                  }}
                  className={[classes.input, classes.categoryDropdown].join(' ')}
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
                      helperText={(
                        <Button
                          size="small"
                          color="secondary"
                          component={LinkTo('/budget-categories')}
                          className={classes.manageCategoriesLink}
                        >
                          Manage categories
                        </Button>
                      )}
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: values.category && (
                          <InputAdornment position="start">
                            <div
                              className={classes.categoryDot}
                              style={{ backgroundColor: values.category.colour }}
                            />
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              )}
              {values.transactionType === 'transfer' && (
                <FormGroup row className={classes.transferFields}>
                  <FormControl className={classes.inlineSelect}>
                    <InputLabel shrink id="transfer-label">Transfer</InputLabel>
                    <Select
                      name="transferDirection"
                      value={values.transferDirection}
                      labelId="transfer-label"
                      onChange={handleChange}
                    >
                      <MenuItem value="from">From</MenuItem>
                      <MenuItem value="to">To</MenuItem>
                    </Select>
                  </FormControl>
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
                </FormGroup>
              )}
              <RuleFields
                transaction={transaction}
                values={values}
                errors={errors}
                touched={touched}
                handleChange={handleChange}
                setFieldValue={setFieldValue}
                filteredTransactions={filteredTransactions}
                toggleShowTransactions={toggleShowTransactions}
                showTransactions={showTransactions}
              />
            </Grid>
          </Grid>
        </Grid>
        {showTransactions && (
          <Grid item md>
            <TransactionsTable
              hideChekboxes
              className={classes.tableWrapper}
              account={account}
              transactions={filteredTransactions}
            />
          </Grid>
        )}
      </Grid>
    </ModalDialog>
  )
}

TransactionDialogComponent.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
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
  accounts: PropTypes.object.isRequired,
  transactions: PropTypes.array.isRequired
}

TransactionDialogComponent.defaultProps = {
  transaction: null
}

export default compose(
  connect(mapStateToProps),
  withFormik({
    enableReinitialize: true,
    mapPropsToValues: ({ accounts, transaction, budget }) => {
      if (transaction === null) {
        return {
          transactionType: 'expense',
          description: '',
          categoryId: null,
          category: null,
          amount: '',
          createdAt: format(Date.now(), 'yyyy-MM-dd'),
          transferDirection: 'to',
          transferAccountId: null,
          transferAccount: null,
          applyToOtherTransactions: true,
          applyToExisting: true,
          applyToFuture: true,
          ruleType: 'equals',
          filterText: '',
          matchAmount: false,
          notes: ''
        }
      }

      const ruleAttributes = {}
      if (transaction.ruleId) {
        const rule = budget.rules[transaction.ruleId]
        const { filterBy } = rule
        if ('description' in filterBy) {
          ruleAttributes.filterText = filterBy.description.value
          ruleAttributes.ruleType = filterBy.description.type
        }
        if ('amount' in filterBy) {
          ruleAttributes.matchAmount = true
        }
      }

      return {
        ...transaction,
        transactionType: getTransactioType(transaction),
        amount: Math.abs(transaction.amount.accountCurrency),
        createdAt: format(new Date(transaction.createdAt), 'yyyy-MM-dd'),
        category: transaction.categoryId ? budget.categoriesById[transaction.categoryId] : null,
        transferDirection: transaction.transferDirection || 'to',
        transferAccount: transaction.transferAccountId ? accounts.byId[transaction.transferAccountId] : null,
        applyToOtherTransactions: true,
        applyToExisting: true,
        applyToFuture: true,
        ruleType: ruleAttributes.ruleType || 'equals',
        filterText: ruleAttributes.filterText || transaction.description,
        matchAmount: ruleAttributes.matchAmount || false,
        notes: transaction.notes || ''
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
    handleSubmit: async (values, { props, setSubmitting, resetForm }) => {
      setSubmitting(true)
      const {
        transactionType,
        category,
        transferAccount,
        applyToOtherTransactions,
        applyToExisting,
        applyToFuture,
        ruleType,
        filterText,
        matchAmount,
        ...rest
      } = values
      const transaction = {
        ...rest,
        amount: {
          accountCurrency: getAmount(values),
          localCurrency: null
        },
        categoryId: (!values.categoryId || values.transactionType === 'transfer' ? undefined : values.categoryId),
        transferAccountId: values.transactionType === 'transfer' ? values.transferAccountId : null,
        notes: values.notes ? values.notes.trim() : null,
        createdAt: parse(values.createdAt, 'yyyy-M-d', new Date()).getTime()
      }
      const rule = getRule(values, props.account.id)
      if (!rule) transaction.ruleId = null
      await props.onSave(transaction, { rule, applyToExisting, applyToFuture })
      resetForm()
      setSubmitting(false)
    }
  })
)(TransactionDialogComponent)
