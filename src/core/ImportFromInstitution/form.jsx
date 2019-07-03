import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { withFormik } from 'formik'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import red from '@material-ui/core/colors/red'
import SubmitButtonWithProgress from '../../common/SubmitButtonWithProgress'
import InstitutionFormFields, {
  initialValues,
  validationScheme,
  instructionsFor
} from './formFields'
import importFromCoinbase from './importers/coinbase'
import { showOverlay, hideOverlay } from '../../store/settings/actions'

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

const mapDispatchToProps = {
  showOverlay,
  hideOverlay
}

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
  handleDelete,
  institution,
  accountGroup
}) => (
  <Grid container direction="row" justify="center">
    <Paper className={classes.root}>
      <div className={classes.formHeader}>
        <Typography variant="h6">
          Import from
          {institution}
        </Typography>
        <IconButton aria-label="Close" className={classes.closeButton} onClick={handleCancel}>
          <CloseIcon />
        </IconButton>
      </div>
      <Divider />
      <Grid container className={classes.input} spacing={16}>
        <Typography variant="caption" paragraph>
          Your browser will connect directly to
          <strong>{institution}</strong>
          so you&apos;re really importing your own data.
        </Typography>
        {instructionsFor(institution)}
      </Grid>
      <form onSubmit={handleSubmit} className={classes.form}>
        {handleDelete && accountGroup && (
          <Button
            size="small"
            onClick={() => handleDelete(accountGroup)}
            className={classes.deleteButton}
            disabled={isSubmitting}
          >
            Delete all&nbsp;
            {accountGroup.accountIds.length}
            &nbsp;accounts connected to&nbsp;
            {institution}
          </Button>
        )}
        <InstitutionFormFields
          institution={institution}
          formClassName={classes.form}
          inputClassName={classes.input}
          values={values}
          handleChange={handleChange}
          errors={errors}
          touched={touched}
        />
        {errors.global && (
          <Typography color="error" variant="caption">{errors.global}</Typography>
        )}
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
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
  withFormik({
    enableReinitialize: true,
    mapPropsToValues: ({ institution, accountGroup }) => {
      if (accountGroup === undefined) {
        return initialValues(institution)
      }
      return accountGroup
    },
    validationSchema: ({ institution }) => validationScheme(institution),
    handleSubmit: (values, { props, setSubmitting, setErrors }) => {
      setSubmitting(true)
      props.showOverlay(`Importing data from ${props.institution} ...`)
      const importData = {
        Coinbase: formValues => importFromCoinbase(formValues)
      }[props.institution]

      importData(values)
        .then(({ accountGroup, accounts }) => {
          props.handleSave(accountGroup, accounts)
          setSubmitting(false)
          props.hideOverlay()
        }).catch((errorMessage) => {
          setErrors({ global: `Sorry, something went wrong.${errorMessage}` })
          setSubmitting(false)
          props.hideOverlay()
        })
    }
  })
)(ImportFromInstitutionFormComponent)
