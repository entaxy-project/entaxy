/* eslint no-console: 0 */
import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { withFormik } from 'formik'
import AutoComplete from '../../common/AutoComplete'
import { createAccount, updateAccount } from '../../store/accounts/actions'
import { sortedInstitutionsForAutoselect } from '../../store/accounts/selectors'

const styles = () => ({
  root: {
    display: 'inline'
  },
  input: {
    margin: '5px',
    width: 200
  }
})

const mapStateToProps = () => {
  return {
    insititutions: sortedInstitutionsForAutoselect()
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleSave: (account) => {
      if ('id' in account) {
        return dispatch(updateAccount(account))
      }
      return dispatch(createAccount(account))
    }
  }
}

const AccountForm = ({
  classes,
  insititutions,
  handleSubmit,
  values,
  handleChange,
  setFieldValue
}) => (
  <form onSubmit={handleSubmit}>
    <AutoComplete
      label="Institution"
      name="institution"
      defaultValue={values.institution}
      options={insititutions}
      onChange={setFieldValue}
    />
    <TextField
      label="Account name"
      inputProps={{
        'aria-label': 'Account name',
        required: true,
        maxLength: 100
      }}
      className={classes.input}
      value={values.account}
      name="name"
      onChange={handleChange}
    />
    <Button type="submit" color="primary">Save</Button>
  </form>
)

AccountForm.propTypes = {
  classes: PropTypes.object.isRequired,
  insititutions: PropTypes.array.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
  withFormik({
    enableReinitialize: true,
    mapPropsToValues: ({ account }) => {
      console.log('mapPropsToValues', account)
      if (account === null) {
        return {
          institution: 'BMO',
          name: ''
        }
      }
      return account
    },
    handleSubmit: (values, { props, setSubmitting, resetForm }) => {
      console.log('handleSubmit', values, props)
      setSubmitting(true)
      props.handleSave(values)
      resetForm()
      setSubmitting(false)
    }
  })
)(AccountForm)
