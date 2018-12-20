/* eslint no-console: 0 */
import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { withFormik } from 'formik'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
// import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Button from '@material-ui/core/Button'
import AutoComplete from '../../common/AutoComplete'
import { sortedInstitutionsForAutoselect } from '../../store/accounts/selectors'

const styles = theme => ({
  root: {
    margin: theme.spacing.unit * 2,
    padding: theme.spacing.unit * 2,
    width: '80%'
  },
  input: {
    margin: theme.spacing.unit * 2
  }
})

const mapStateToProps = (state, ownProps) => {
  return {
    account: state.accounts.find(acc => acc.id === ownProps.accountId),
    institutions: sortedInstitutionsForAutoselect()
  }
}

const AccountForm = ({
  classes,
  institutions,
  handleSubmit,
  values,
  handleChange,
  setFieldValue,
  handleCancel
}) => (
  <Grid container direction="row" justify="center">
    <Paper className={classes.root}>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Account name"
          inputProps={{
            'aria-label': 'Account name',
            required: true,
            maxLength: 100
          }}
          className={classes.input}
          value={values.name}
          name="name"
          onChange={handleChange}
          autofocus
        />
        <AutoComplete
          label="Institution"
          name="institution"
          value={values.institution}
          options={institutions}
          onChange={setFieldValue}
          className={classes.input}
        />
        <Divider />
        <Button type="submit" color="primary">Save</Button>
        <Button onClick={handleCancel} color="primary">Cancel</Button>
      </form>
    </Paper>
  </Grid>
)

AccountForm.propTypes = {
  classes: PropTypes.object.isRequired,
  institutions: PropTypes.array.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired
}

export default compose(
  connect(mapStateToProps),
  withStyles(styles),
  withFormik({
    enableReinitialize: true,
    mapPropsToValues: ({ account }) => {
      if (account === undefined) {
        return {
          institution: null,
          name: null
        }
      }
      return {
        ...account,
        institution: { label: account.institution, value: account.institution }
      }
    },
    handleSubmit: (values, { props, setSubmitting, resetForm }) => {
      setSubmitting(true)
      props.handleSave({ ...values, institution: values.institution.value })
      resetForm()
      setSubmitting(false)
    }
  })
)(AccountForm)
