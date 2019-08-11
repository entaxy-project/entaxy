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
import AutoComplete from '../../common/AutoComplete'
import institutions from '../../data/institutions'
import SubmitButtonWithProgress from '../../common/SubmitButtonWithProgress'
import DescriptionCard from '../../common/DescriptionCard'
import LinkTo from '../../common/LinkTo'

const styles = theme => ({
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
    display: 'flex',
    flexDirection: 'column'
  },
  input: {
    margin: theme.spacing(2),
    width: 320
  },
  inputError: {
    marginTop: -7,
    marginLeft: theme.spacing(2)
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: 10
  },
  deleteButton: {
    color: red[500],
    margin: theme.spacing(2)
  }
})

const mapStateToProps = (state, ownProps) => ({
  settings: state.settings,
  accountInstitutions: Object.keys(state.accounts.byInstitution),
  account: state.accounts.byId[ownProps.accountId],
  accounts: state.accounts
})

export class AccountFormComponent extends React.Component {
  state = {
    hideInstitutionOptions: false
  }

  institutionOptions = (institution) => {
    const { classes } = this.props
    const { hideInstitutionOptions } = this.state
    const { value } = (institution || {})

    if (!Object.keys(institutions).includes(value) || hideInstitutionOptions) return null

    if (institutions[value].importTypes.includes('API')) {
      return (
        <DescriptionCard
          info
          className={classes.input}
          actions={(
            <Grid align="center">
              <Button
                size="small"
                color="secondary"
                component={LinkTo(`/institutions/${value}/import/new`)}
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
          <Typography variant="caption" paragraph>
            You can import&nbsp;
            <strong>all your accounts</strong>
            &nbsp;in one go from&nbsp;
            <strong>{institutions[value].name}</strong>
            &nbsp;by using their API.
          </Typography>
          <Typography variant="caption" align="center">
            This is also the easiest way to keep your transactions up to date.
          </Typography>
        </DescriptionCard>
      )
    }
    return null
  }

  handleInstitutionChange = (...args) => {
    this.setState({ hideInstitutionOptions: false })
    this.props.setFieldValue(...args)
  }

  handleCloseInstitutionOptions = () => {
    this.setState({ hideInstitutionOptions: true })
  }


  formatedInstitutions = () => {
    const allInstitutions = new Set(this.props.accountInstitutions.concat(Object.keys(institutions)))
    return Array.from(allInstitutions).sort().map(key => ({ value: key, label: key }))
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
    return (
      <Grid container direction="row" justify="center">
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
            <AutoComplete
              creatable
              className={classes.input}
              label="Institution"
              name="institution"
              value={values.institution}
              options={this.formatedInstitutions()}
              onChange={this.handleInstitutionChange}
              error={errors.institution && touched.institution}
              helperText={errors.institution}
              autoFocus
            />
            {this.institutionOptions(values.institution)}
            <TextField
              className={classes.input}
              label="Account name"
              inputProps={{
                'aria-label': 'Account name',
                maxLength: 100
              }}
              value={values.name}
              name="name"
              onChange={handleChange}
              error={errors.name && touched.name}
              helperText={errors.name}
            />
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
              error={errors.openingBalance && touched.openingBalance}
              helperText={errors.openingBalance}
            />
            <TextField
              type="date"
              label="Opening Balance Date"
              InputLabelProps={{
                shrink: true,
                'aria-label': 'Opening Balance Date'
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
              label="Account Currency"
              name="currency"
              value={values.currency}
              loadOptions={filteredFiatCurrencies}
              onChange={setFieldValue}
              error={errors.currency && touched.currency}
              helperText={errors.currency}
            />
            {handleDelete && (
              <Button
                size="small"
                onClick={() => handleDelete(account)}
                className={classes.deleteButton}
                disabled={isSubmitting}
              >
                Delete this account
              </Button>
            )}
            <Divider />
            <div className={classes.formActions}>
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
  accountInstitutions: PropTypes.array.isRequired,
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
          name: '',
          institution: null,
          openingBalance: 0,
          openingBalanceDate: format(Date.now(), 'YYYY-MM-DD'),
          currency: settings.currency === undefined ? null : {
            label: `(${settings.currency}) ${fiatCurrencies[settings.currency]}`,
            value: settings.currency
          }
        }
      }
      return {
        ...account,
        openingBalanceDate: format(new Date(account.openingBalanceDate), 'YYYY-MM-DD'),
        institution: {
          label: account.institution,
          value: account.institution
        },
        currency: {
          label: `(${account.currency}) ${fiatCurrencies[account.currency]}`,
          value: account.currency
        }
      }
    },
    validationSchema: (props) => {
      return Yup.lazy((values) => {
        const accountNames = Object.values(props.accounts.byId).filter(
          account => account.institution === values.institution.value
        ).map(account => account.name)
        console.log(accountNames, values)
        return Yup.object().shape({
          name: Yup.string()
            .max(50, 'Too Long!')
            .required('Please enter a name for this account')
            .notOneOf(accountNames, `There's already an account with this name in ${values.institution.value}`),
          institution: Yup.object()
            .required('Please select an institution')
            .nullable(accountNames),
          openingBalance: Yup.number()
            .required('Please enter an opening balance')
            .min(-999999999.99)
            .max(999999999.99),
          openingBalanceDate: Yup.date()
            .required('Please select the date of the opening balance'),
          currency: Yup.object()
            .required('Please select the currency of this account')
            .nullable()
        })
      })
    },
    handleSubmit: async (values, { props, setSubmitting }) => {
      setSubmitting(true)
      await props.handleSave({
        ...values,
        institution: values.institution.value,
        openingBalanceDate: parse(values.openingBalanceDate).getTime(),
        currency: values.currency.value
      })
      setSubmitting(false)
    }
  })
)(AccountFormComponent)
