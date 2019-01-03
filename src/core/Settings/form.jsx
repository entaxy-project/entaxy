import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { withFormik } from 'formik'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import red from '@material-ui/core/colors/red'
import green from '@material-ui/core/colors/green'
import AsyncSelect from 'react-select/lib/Async'
import currencies from '../../data/currencies'
import locales from '../../data/locales'

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
  buttonWrapper: {
    margin: theme.spacing.unit,
    position: 'relative'
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  close: {
    padding: theme.spacing.unit / 2
  }
})

const mapStateToProps = ({ settings }) => ({ settings })

const formatedLocales = Object.keys(locales).map(key => ({ value: key, label: locales[key] }))
const formatedCurrencies = Object.keys(currencies).map(key => ({ value: key, label: `(${key}) ${currencies[key]}` }))

export class SettingsFormComponent extends React.Component {
  filteredCurrencies = (inputValue) => {
    return new Promise((resolve) => {
      if (inputValue) {
        resolve(formatedCurrencies.filter(currency => currency.label.toLowerCase().includes(inputValue.toLowerCase())))
      }
      resolve(formatedCurrencies)
    })
  }

  filteredLocales = (inputValue) => {
    return new Promise((resolve) => {
      if (inputValue) {
        resolve(formatedLocales.filter(locale => locale.label.toLowerCase().includes(inputValue.toLowerCase())))
      }
      resolve(formatedLocales)
    })
  }

  render() {
    const {
      classes,
      handleReset,
      handleSubmit,
      values,
      setFieldValue,
      isSubmitting
    } = this.props
    return (
      <form onSubmit={handleSubmit} className={classes.form}>
        <Typography variant="subtitle2" className={classes.inputTitle}>Language / Country</Typography>
        <AsyncSelect
          label="Language / Country"
          name="locale"
          value={values.locale}
          cacheOptions
          defaultOptions
          loadOptions={this.filteredLocales}
          onChange={selection => setFieldValue('locale', selection)}
          className={classes.input}
          isClearable={true}
          inputProps={{ 'aria-label': 'Language / Country', required: true }}
        />
        <Typography variant="subtitle2" className={classes.inputTitle}>Display Currency</Typography>
        <AsyncSelect
          label="Display Currency"
          name="currency"
          value={values.currency}
          cacheOptions
          loadOptions={this.filteredCurrencies}
          onChange={selection => setFieldValue('currency', selection)}
          className={classes.input}
          isClearable={true}
          inputProps={{ 'aria-label': 'Display Currency', required: true }}
        />
        <Button
          size="small"
          onClick={handleReset}
          className={classes.deleteButton}
        >
          Reset (Delete all my data)
        </Button>
        <Divider />
        <div className={classes.formActions}>
          <div className={classes.buttonWrapper}>
            <Button type="submit" color="secondary" disabled={isSubmitting}>Save</Button>
            {isSubmitting && <CircularProgress size={24} className={classes.buttonProgress} />}
          </div>
        </div>
      </form>
    )
  }
}

SettingsFormComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  handleReset: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
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
