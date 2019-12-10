/* eslint-disable react/sort-comp */
/* eslint-disable react/no-multi-comp */
import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { withFormik } from 'formik'
import * as Yup from 'yup'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Divider from '@material-ui/core/Divider'
import Button from '@material-ui/core/Button'
import red from '@material-ui/core/colors/red'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import { fiatCurrencies, filteredFiatCurrencies } from '../../data/currencies'
import { accountTypes } from '../../store/accounts/reducer'
import AutoComplete from '../../common/AutoComplete'
import { institutions, sortedInstitutionsOfType } from '../../data/institutions'
import SubmitButtonWithProgress from '../../common/SubmitButtonWithProgress'
import DescriptionCard from '../../common/DescriptionCard'
import LinkTo from '../../common/LinkTo'
import InstitutionIcon from '../../common/InstitutionIcon'

const styles = (theme) => ({
  root: {
    margin: theme.spacing(2),
    padding: theme.spacing(2)
  },
  formHeader: {
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  closeButton: {
    marginTop: -10
  },
  form: {
    width: 560
  },
  input: {
    margin: theme.spacing(2),
    width: 250
  },
  inputError: {
    marginTop: -7,
    marginLeft: theme.spacing(2)
  },
  formActions: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: 10
  },
  deleteButton: {
    color: red[500],
    marginLeft: theme.spacing(2)
  }
})

const mapStateToProps = (state, ownProps) => ({
  settings: state.settings,
  account: state.accounts.byId[ownProps.accountId],
  accounts: state.accounts
})

const accountTypesValues = Object.keys(accountTypes).map((type) => ({
  label: accountTypes[type], value: type
}))

const institutionLabel = (institutionName) => (
  <Typography variant="caption">
    <InstitutionIcon institution={institutionName} size="small" />
    &nbsp;&nbsp;{institutionName}
  </Typography>
)

export class AccountFormComponent extends React.Component {
  state = {
    hideInstitutionOptions: false
  }

  institutionOptions = (selectedInstitution) => {
    const { classes } = this.props
    const { hideInstitutionOptions } = this.state
    const { value } = selectedInstitution || {}
    if (hideInstitutionOptions) return null
    if (!Object.keys(institutions.crypto).includes(value)) return null

    const institution = institutions.crypto[value]

    if (institution.importTypes.includes('API')) {
      return (
        <DescriptionCard
          className={classes.input}
          actions={(
            <Grid align="center">
              <Button
                size="small"
                color="secondary"
                component={LinkTo(`/institutions/${institution.name}/import/new`)}
              >
                Great, Let&apos;s do it
              </Button>
              <Button
                size="small"
                color="primary"
                onClick={this.handleCloseInstitutionOptions}
              >
                No, I&apos;d rather do it manually
              </Button>
            </Grid>
          )}
        >
          <Typography variant="caption" align="center" paragraph>
            You can import&nbsp;
            <strong>all your accounts</strong>
            &nbsp;in one go from&nbsp;
            <strong>{institution.name}</strong>
            &nbsp;by using their API.
          </Typography>
          <Typography variant="caption" align="center" paragraph>
            This is also the easiest way to keep your transactions up to date.
          </Typography>
          <Typography variant="caption" align="center" paragraph gutterBottom={false}>
            NOTE: this browser will connect directly to {institution.name}.
            Your transactions will not go through any third party server.
          </Typography>
        </DescriptionCard>
      )
    }
    return null
  }

  handleAccountTypeChange = (...args) => {
    this.props.setFieldValue('institution', null)
    this.props.setFieldValue(...args)
  }

  handleInstitutionChange = (...args) => {
    this.setState({ hideInstitutionOptions: false })
    this.props.setFieldValue(...args)
  }

  handleCloseInstitutionOptions = () => {
    this.setState({ hideInstitutionOptions: true })
  }

  generateFormatedInstitutions = () => {
    const { accountType: { value: accountType } } = this.props.values
    let institutionType
    switch (accountType) {
      case 'bank':
      case 'credit':
        institutionType = 'fiat'
        break
      case 'wallet':
        institutionType = 'crypto'
        break
      // no default
    }

    const allInstitutions = Object.keys(this.props.accounts.byInstitution).reduce((result, institutionName) => {
      if (
        institutionName === accountTypes.cash
        || institutionName in institutions.fiat
        || institutionName in institutions.crypto
      ) return result
      return {
        ...result,
        [institutionName]: { name: institutionName }
      }
    }, sortedInstitutionsOfType(institutionType))

    return Object.keys(allInstitutions).sort().map((key) => ({
      value: key,
      label: institutionLabel(key)
    }))
  }


  render() {
    const {
      classes,
      handleSubmit,
      isSubmitting,
      values,
      errors,
      touched,
      handleChange,
      setFieldValue,
      handleDelete,
      handleCancel,
      account
    } = this.props

    const formatedInstitutions = this.generateFormatedInstitutions()
    const usedInstitutions = Object.keys(this.props.accounts.byInstitution).sort()
    const filterInstitutions = (option, inputValue) => {
      if (inputValue === '') return usedInstitutions.includes(option.value)
      const words = inputValue.split(' ')
      return words.reduce((result, cur) => (
        result && option.value.toLowerCase().includes(cur.toLowerCase())
      ), true)
    }
    const institutionError = typeof errors.institution === 'object'
      ? errors.institution.value
      : errors.institution
    const institutionWasTouched = typeof touched.institution === 'object'
      ? !!touched.institution.value
      : !!touched.institution

    return (
      <Grid container justify="center">
        <Paper className={classes.root}>
          <div className={classes.formHeader}>
            <Typography variant="h6">
              {account ? 'Edit account' : 'New account'}
            </Typography>
            <IconButton aria-label="Close" className={classes.closeButton} onClick={handleCancel}>
              <CloseIcon />
            </IconButton>
          </div>
          <Divider />
          <form onSubmit={handleSubmit} className={classes.form}>
            <Grid container justify="center">
              <Grid item xs={6}>
                <AutoComplete
                  className={classes.input}
                  label="Account type"
                  name="accountType"
                  value={values.accountType}
                  options={accountTypesValues}
                  onChange={this.handleAccountTypeChange}
                  error={errors.accountType && touched.accountType}
                  helperText={errors.accountType}
                  autoFocus
                />
                {values.accountType.value !== 'cash' && (
                  <AutoComplete
                    creatable
                    isClearable={true}
                    noOptionsMessage={() => null}
                    className={classes.input}
                    label="Institution"
                    placeholder="Select or type to create ..."
                    name="institution"
                    value={values.institution}
                    options={formatedInstitutions}
                    filterOption={filterInstitutions}
                    onChange={this.handleInstitutionChange}
                    error={!!institutionError && institutionWasTouched}
                    helperText={institutionError}
                  />
                )}
                {this.institutionOptions(values.institution)}
                <TextField
                  className={classes.input}
                  label="Account name"
                  inputProps={{
                    'aria-label': 'Account name',
                    maxLength: 40
                  }}
                  value={values.name}
                  name="name"
                  onChange={handleChange}
                  error={errors.name && touched.name}
                  helperText={errors.name}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  type="number"
                  className={classes.input}
                  label="Opening balance"
                  inputProps={{
                    'aria-label': 'Opening balance',
                    step: 0.01
                  }}
                  value={values.openingBalance}
                  name="openingBalance"
                  onChange={handleChange}
                  onFocus={(event) => event.target.select()}
                  error={errors.openingBalance && touched.openingBalance}
                  helperText={errors.openingBalance}
                />
                <TextField
                  type="date"
                  label="Opening balance date"
                  InputLabelProps={{
                    shrink: true,
                    'aria-label': 'Opening balance date'
                  }}
                  name="openingBalanceDate"
                  className={classes.input}
                  value={values.openingBalanceDate}
                  onChange={handleChange}
                  error={errors.openingBalanceDate && touched.openingBalanceDate}
                  helperText={errors.openingBalanceDate}
                />
                <AutoComplete
                  async
                  className={classes.input}
                  label="Account currency"
                  name="currency"
                  value={values.currency}
                  loadOptions={filteredFiatCurrencies}
                  onChange={setFieldValue}
                  error={errors.currency && touched.currency}
                  helperText={errors.currency}
                />
              </Grid>
            </Grid>

            <Divider />
            <div className={classes.formActions}>
              {handleDelete && (
                <Button
                  onClick={() => handleDelete(account)}
                  className={classes.deleteButton}
                  disabled={isSubmitting}
                >
                  Delete this account
                </Button>
              )}
              <div />
              <SubmitButtonWithProgress label="Save" isSubmitting={isSubmitting} />
            </div>
          </form>
        </Paper>
      </Grid>
    )
  }
}

AccountFormComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  values: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  touched: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  handleDelete: PropTypes.func,
  handleCancel: PropTypes.func.isRequired,
  accounts: PropTypes.object.isRequired,
  account: PropTypes.object
}

AccountFormComponent.defaultProps = {
  handleDelete: null,
  account: null
}

export default compose(
  connect(mapStateToProps),
  withStyles(styles),
  withFormik({
    enableReinitialize: true,
    mapPropsToValues: ({ account, settings }) => {
      if (account === undefined) {
        return {
          institution: null,
          name: '',
          accountType: accountTypesValues[0],
          openingBalance: 0,
          openingBalanceDate: format(Date.now(), 'yyyy-MM-dd'),
          currency: settings.currency === undefined ? null : {
            label: `(${settings.currency}) ${fiatCurrencies[settings.currency]}`,
            value: settings.currency
          }
        }
      }
      return {
        ...account,
        openingBalanceDate: format(new Date(account.openingBalanceDate), 'yyyy-MM-dd'),
        institution: account.institution ? {
          label: institutionLabel(account.institution),
          value: account.institution
        } : null,
        accountType: {
          label: accountTypes[account.accountType],
          value: account.accountType
        },
        currency: {
          label: `(${account.currency}) ${fiatCurrencies[account.currency]}`,
          value: account.currency
        }
      }
    },
    validationSchema: (props) => {
      const accountNames = (institution) => Object.values(props.accounts.byId).reduce(
        (result, account) => {
          if (props.account !== undefined && account.id === props.account.id) return result
          if (account.institution !== institution) return result
          return [...result, account.name.trim()]
        },
        []
      )
      return Yup.object().shape({
        accountType: Yup.object()
          .required('Please select an account type')
          .nullable(),
        institution: Yup.object()
          .nullable()
          .when('accountType', {
            is: (accountType) => accountType.value !== 'cash',
            then: Yup.object().required('Please select or create an institution')
          })
          .shape({
            value: Yup.string()
              .max(40, 'Too Long! 40 characters max'),
            label: Yup.string()
          })
          .when('accountType', {
            is: (accountType) => accountType.value === 'cash',
            then: Yup.object()
              .nullable(),
            otherwise: Yup.object()
              .required('Please select or create an institution')
              .nullable()
          }),
        name: Yup.string()
          .trim()
          .max(40, 'Too Long! 40 characters max')
          .required('Please enter a name for this account')
          .when('institution', (institution, schema) => {
            if (!institution) return schema
            return schema.notOneOf(
              accountNames(institution.value),
              'This account is already being used in this institution'
            )
          }),
        openingBalance: Yup.number()
          .required('Please enter an opening balance')
          .min(-9999999.99, 'The Opening balance can\'t exceed -9,999,999.99')
          .max(9999999.99, 'The Opening balance can\'t exceed 9,999,999.99'),
        openingBalanceDate: Yup.date()
          .required('Please select the date of the opening balance')
          .max(new Date(), 'The opening balance cannot be in the future'),
        currency: Yup.object()
          .required('Please select the currency of this account')
          .nullable()
      })
    },
    handleSubmit: async (values, { props, setSubmitting }) => {
      setSubmitting(true)
      await props.handleSave({
        ...values,
        name: values.name.trim(),
        accountType: values.accountType.value,
        institution: values.accountType.value !== 'cash' ? values.institution.value : accountTypes.cash,
        openingBalanceDate: parse(values.openingBalanceDate, 'yyyy-M-d', new Date()).getTime(),
        currency: values.currency.value
      })
      setSubmitting(false)
    }
  })
)(AccountFormComponent)
