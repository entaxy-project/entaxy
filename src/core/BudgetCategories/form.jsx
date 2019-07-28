import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { withFormik } from 'formik'
import * as Yup from 'yup'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'
import Divider from '@material-ui/core/Divider'
import SubmitButtonWithProgress from '../../common/SubmitButtonWithProgress'

const styles = theme => ({
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  input: {
    margin: theme.spacing(2),
    width: 320
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: 10
  }
})

const mapStateToProps = state => ({
  budget: state.budget
})

const CategoryFormComponent = ({
  classes,
  handleSubmit,
  isSubmitting,
  values,
  errors,
  touched,
  handleChange
}) => {
  return (
    <form onSubmit={handleSubmit} className={classes.form}>
      <TextField
        className={classes.input}
        label="Category name"
        inputProps={{
          'aria-label': 'Category name',
          maxLength: 100
        }}
        value={values.label}
        name="label"
        onChange={handleChange}
        error={errors.label && touched.label}
        helperText={errors.label}
      />
      <Divider />
      <div className={classes.formActions}>
        <SubmitButtonWithProgress label="Save" isSubmitting={isSubmitting} />
        <SubmitButtonWithProgress label="Cancel" isSubmitting={isSubmitting} />
      </div>
    </form>
  )
}

CategoryFormComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  values: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  touched: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired
}

export default compose(
  connect(mapStateToProps),
  withStyles(styles),
  withFormik({
    enableReinitialize: true,
    mapPropsToValues: ({ category }) => {
      if (category === undefined) {
        return {
          label: ''
        }
      }
      return category
    },
    validationSchema: Yup.object().shape({
      label: Yup.string()
        .max(100, 'Too Long!')
        .required('Please enter a name for this account')
    }),
    handleSubmit: async (values, { props, setSubmitting }) => {
      setSubmitting(true)
      await props.handleSave(values)
      setSubmitting(false)
    }
  })
)(CategoryFormComponent)
