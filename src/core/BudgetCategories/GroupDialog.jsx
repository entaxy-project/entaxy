import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { withFormik } from 'formik'
import * as Yup from 'yup'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'
import ModalDialog from '../../common/ModalDialog'
import { createCategory, updateCategory } from '../../store/budget/actions'

const styles = (theme) => ({
  input: {
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
    width: '100%'
  }
})

const mapStateToProps = (state) => ({
  budget: state.budget
})

const mapDispatchToProps = (dispatch) => {
  return {
    handleSave: (category) => {
      if ('id' in category) {
        return dispatch(updateCategory(category))
      }
      return dispatch(createCategory(category))
    }
  }
}

export const GroupDialogComponent = ({
  classes,
  handleSubmit,
  values,
  errors,
  touched,
  handleChange,
  onCancel,
  open,
  category
}) => (
  <ModalDialog
    open={open}
    title={category ? 'Edit group' : 'New group'}
    onSubmit={handleSubmit}
    onCancel={onCancel}
    className={classes.root}
  >
    <TextField
      label="Name"
      inputProps={{
        'aria-label': 'Name',
        maxLength: 25
      }}
      className={classes.input}
      value={values.name}
      name="name"
      onChange={handleChange}
      error={errors.name && touched.name}
      helperText={errors.name}
      autoFocus
    />
  </ModalDialog>
)

GroupDialogComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  touched: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  category: PropTypes.object
}

GroupDialogComponent.defaultProps = {
  category: null
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
  withFormik({
    enableReinitialize: true,
    mapPropsToValues: ({ category }) => {
      if (category === null) {
        return {
          name: ''
        }
      }
      return category
    },
    validationSchema: (props) => {
      const groupNames = Object.values(props.budget.categoriesById).reduce(
        (result, category) => {
          if ('parentId' in category) return result // only groups
          if (!!props.category && category.id === props.category.id) return result
          return [...result, category.name]
        },
        []
      )
      return Yup.object().shape({
        name: Yup.string()
          .max(25, 'Too Long! 25 characters max')
          .required('Please enter a name')
          .notOneOf(groupNames, 'This category already exists')
      })
    },
    handleSubmit: (values, { props, setSubmitting, resetForm }) => {
      setSubmitting(true)
      props.handleSave(values)
      resetForm()
      setSubmitting(false)
      props.onCancel()
    }
  })
)(GroupDialogComponent)
