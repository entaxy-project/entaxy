import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { withFormik } from 'formik'
import * as Yup from 'yup'
import PropTypes from 'prop-types'
import Divider from '@material-ui/core/Divider'
import Button from '@material-ui/core/Button'
import red from '@material-ui/core/colors/red'
import AutoComplete from '../../common/AutoComplete'
import SubmitButtonWithProgress from '../../common/SubmitButtonWithProgress'
import currencies, { filteredCurrencies } from '../../data/currencies'
import locales, { filteredLocales } from '../../data/locales'
import confirm from '../../util/confirm'

const styles = theme => ({
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  inputTitle: {
    marginLeft: theme.spacing.unit * 2,
    marginTop: theme.spacing.unit * 2,
    marginBottom: -theme.spacing.unit * 2
  },
  input: {
    margin: theme.spacing.unit * 2,
    width: 320
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
  close: {
    padding: theme.spacing.unit / 2
  }
})

const mapStateToProps = ({ settings }) => ({ settings })

export class SettingsFormComponent extends React.Component {
  handleResetData = () => {
    confirm('Delete all your data? This cannot be undone.', 'Are you sure?').then(() => {
      this.props.handleDeleteAllData()
    })
  }

  render() {
    const {
      classes,
      handleSubmit,
      values,
      errors,
      touched,
      setFieldValue,
      isSubmitting
    } = this.props

    return (
      <form onSubmit={handleSubmit} className={classes.form}>
        <AutoComplete
          async
          className={classes.input}
          label="Language / Country"
          name="locale"
          value={values.locale}
          loadOptions={filteredLocales}
          onChange={setFieldValue}
          error={errors.locale && touched.locale}
          helperText={errors.locale}
        />
        <AutoComplete
          async
          className={classes.input}
          label="Display Currency"
          name="currency"
          value={values.currency}
          loadOptions={filteredCurrencies}
          onChange={setFieldValue}
          error={errors.currency && touched.currency}
          helperText={errors.currency}
        />
        <Button
          size="small"
          onClick={this.handleResetData}
          className={classes.deleteButton}
          disabled={isSubmitting}
        >
          Reset - delete all my data
        </Button>
        <Divider />
        <div className={classes.formActions}>
          <SubmitButtonWithProgress label="Save" isSubmitting={isSubmitting} />
        </div>
      </form>
    )
  }
}

SettingsFormComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  handleDeleteAllData: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  touched: PropTypes.object.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired
}

export default compose(
  connect(mapStateToProps),
  withStyles(styles),
  withFormik({
    mapPropsToValues: ({ settings }) => {
      return ({
        ...settings,
        locale: {
          label: locales[settings.locale],
          value: settings.locale
        },
        currency: settings.currency === undefined ? '' : {
          label: currencies[settings.currency],
          value: settings.currency
        }
      })
    },
    validationSchema: Yup.object().shape({
      locale: Yup.object()
        .required('Please select a language / country')
        .nullable(),
      currency: Yup.object()
        .required('Please select a currency')
        .nullable()
    }),
    handleSubmit: (values, { props, setSubmitting }) => {
      setSubmitting(true)
      props.handleSave({
        ...values,
        locale: values.locale.value,
        currency: values.currency.value
      }).then(() => {
        setSubmitting(false)
      })
    }
  })
)(SettingsFormComponent)
