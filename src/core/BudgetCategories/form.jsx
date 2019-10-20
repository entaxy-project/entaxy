import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { withFormik } from 'formik'
import * as Yup from 'yup'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import SubmitButtonWithProgress from '../../common/SubmitButtonWithProgress'
import { createCategory, updateCategory } from '../../store/budget/actions'

const styles = (theme) => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    paddingBottom: 0
  },
  input: {
    // margin: theme.spacing(2)
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: 10
  },
  buttonWrapper: {
    margin: theme.spacing(1),
    position: 'relative'
  }
})

const mapStateToProps = (state) => ({
  budget: state.budget
})

const mapDispatchToProps = {
  handleCreate: (category, groupId) => createCategory(category, groupId),
  handleUpdate: (category) => updateCategory(category)
}

const CategoryFormComponent = ({
  classes,
  handleSubmit,
  isSubmitting,
  values,
  errors,
  touched,
  handleChange,
  handleCancel,
  group
}) => {
  return (
    <form onSubmit={handleSubmit} className={classes.form}>
      <TextField
        className={classes.input}
        margin="dense"
        label="Category name"
        inputProps={{
          'aria-label': 'Category name',
          maxLength: 25
        }}
        value={values.name}
        name="name"
        onChange={handleChange}
        error={errors.name && touched.name}
        helperText={errors.name}
        autoFocus
      />
      {!group.isIncome && (
        <TextField
          className={classes.input}
          margin="dense"
          label="Budget limit"
          inputProps={{
            'aria-label': 'Budget limit'
          }}
          value={values.budgetLimit}
          name="budgetLimit"
          onChange={handleChange}
          error={errors.budgetLimit && touched.budgetLimit}
          helperText={errors.budgetLimit}
        />
      )}
      <div className={classes.formActions}>
        <SubmitButtonWithProgress label="Save" isSubmitting={isSubmitting} />
        <div className={classes.buttonWrapper}>
          <Button color="secondary" onClick={handleCancel}>Cancel</Button>
        </div>
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
  handleChange: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  group: PropTypes.object.isRequired
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
  withFormik({
    enableReinitialize: true,
    mapPropsToValues: ({ category }) => {
      if (category === undefined) {
        return {
          name: '',
          budgetLimit: 0
        }
      }
      return category
    },
    validationSchema: (props) => {
      const categoryNames = Object.values(props.budget.categoriesById).reduce(
        (result, category) => {
          if (!('parentId' in category)) return result // only categories
          if ('category' in props && category.id === props.category.id) {
            return result
          }
          return [...result, category.name]
        },
        []
      )
      return Yup.object().shape({
        name: Yup.string()
          .max(25, 'Too Long! 25 characters max')
          .required('Please enter a name')
          .notOneOf(categoryNames, 'This category already exists')
      })
    },
    handleSubmit: (values, { props, setSubmitting }) => {
      setSubmitting(true)
      if ('id' in values) {
        props.handleUpdate(values)
      } else {
        props.handleCreate(values, props.group.id)
      }
      props.handleCancel()
      setSubmitting(false)
    }
  })
)(CategoryFormComponent)
