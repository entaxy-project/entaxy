/* eslint-disable no-console */
import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { withFormik } from 'formik'
import * as Yup from 'yup'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import red from '@material-ui/core/colors/red'
import SubmitButtonWithProgress from '../../common/SubmitButtonWithProgress'
import DescriptionCard from '../../common/DescriptionCard'
import importFromCoinbase from './importers/coinbase'

const styles = theme => ({
  root: {
    margin: theme.spacing.unit * 2,
    padding: theme.spacing.unit * 2
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
    margin: theme.spacing.unit * 2,
    width: 400
  },
  inputTitle: {
    marginLeft: theme.spacing.unit * 2,
    marginTop: theme.spacing.unit * 2,
    marginBottom: -theme.spacing.unit * 2
  },
  inputError: {
    marginTop: -7,
    marginLeft: theme.spacing.unit * 2
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: 10
  },
  deleteButton: {
    color: red[500],
    margin: theme.spacing.unit * 2
  },
  instructions: {
    padding: theme.spacing.unit * 2
  }
})

const mapStateToProps = (state, ownProps) => {
  const institutionData = state.accounts.byInstitution[ownProps.institution]
  return {
    settings: state.settings,
    accountGroup: institutionData ? institutionData.groups[ownProps.groupId] : undefined
  }
}

export const ImportFromInstitutionFormComponent = ({
  classes,
  handleSubmit,
  isSubmitting,
  values,
  errors,
  touched,
  handleChange,
  handleCancel,
  institution,
  accountGroup,
  handleDelete
}) => (
  <Grid container direction="row" justify="center">
    <Paper className={classes.root}>
      <div className={classes.formHeader}>
        <Typography variant="h6">
          Import from {institution}
        </Typography>
        <IconButton aria-label="Close" className={classes.closeButton} onClick={handleCancel}>
          <CloseIcon />
        </IconButton>
      </div>
      <Divider />
      <Grid container className={classes.input} spacing={16}>
        <Typography variant="caption" paragraph>
          Your browser will connect directly to <strong>{institution}</strong> using
          the API key you enter bellow, so you&apos;re really importing your own data.
        </Typography>
        <Typography variant="caption" paragraph>
          <NavLink to="/">Create an API key on Coinbase</NavLink> (opens in a new tab)
        </Typography>
        <DescriptionCard info>
          <Typography variant="caption">
            Make sure your api key has access to <strong>all accounts</strong> and has
            the following permimisions:
            <ul>
              <li><strong>wallet:accounts:read</strong></li>
              <li><strong>wallet:transactions:read</strong></li>
            </ul>
          </Typography>
        </DescriptionCard>
      </Grid>
      <form onSubmit={handleSubmit} className={classes.form}>
        {handleDelete && accountGroup &&
          <Button
            size="small"
            onClick={() => handleDelete(accountGroup)}
            className={classes.deleteButton}
            disabled={isSubmitting}
          >
            Delete all {accountGroup.accountIds.length} accounts connected to {institution}
          </Button>
        }
        <TextField
          className={classes.input}
          label="API key"
          inputProps={{
            'aria-label': 'API key',
            maxLength: 100
          }}
          value={values.apiKey}
          name="apiKey"
          onChange={handleChange}
          error={errors.apiKey && touched.apiKey}
          helperText={errors.apiKey}
        />
        <TextField
          className={classes.input}
          label="API secret"
          inputProps={{
            'aria-label': 'API secret',
            maxLength: 100
          }}
          value={values.apiSecret}
          name="apiSecret"
          onChange={handleChange}
          error={errors.apiSecret && touched.apiSecret}
          helperText={errors.apiSecret}
        />
        {errors.global &&
          <Typography color="error" variant="caption">{errors.global}</Typography>
        }
        <Divider />
        <div className={classes.formActions}>
          <SubmitButtonWithProgress label="Import" isSubmitting={isSubmitting} />
        </div>
      </form>
    </Paper>
  </Grid>
)

ImportFromInstitutionFormComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  values: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  touched: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  institution: PropTypes.string.isRequired,
  accountGroup: PropTypes.object,
  handleDelete: PropTypes.func
}

ImportFromInstitutionFormComponent.defaultProps = {
  accountGroup: undefined,
  handleDelete: undefined
}

export default compose(
  connect(mapStateToProps),
  withStyles(styles),
  withFormik({
    enableReinitialize: true,
    mapPropsToValues: ({ accountGroup }) => {
      if (accountGroup === undefined) {
        return {
          apiKey: '',
          apiSecret: ''
        }
      }
      return accountGroup
    },
    validationSchema: Yup.object().shape({
      apiKey: Yup.string()
        .max(100, 'Too Long!')
        .required('Please enter the API key'),
      apiSecret: Yup.string()
        .max(100, 'Too Long!')
        .required('Please enter the API secret')
    }),
    handleSubmit: (values, { props, setSubmitting, setErrors }) => {
      const { apiKey, apiSecret } = values
      setSubmitting(true)
      importFromCoinbase(apiKey, apiSecret)
        .then((accounts) => {
          props.handleSave({ apiKey, apiSecret }, accounts)
          setSubmitting(false)
        }).catch((errorMessage) => {
          setErrors({ global: `Sorry, something went wrong.${errorMessage}` })
          setSubmitting(false)
        })
    }
  })
)(ImportFromInstitutionFormComponent)
