import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { withFormik } from 'formik'
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
import AutoComplete from '../../common/AutoComplete'
import { sortedInstitutionsForAutoselect } from '../../store/accounts/selectors'

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
  }
})

const mapStateToProps = (state, ownProps) => {
  return {
    account: state.accounts.find(acc => acc.id === ownProps.accountId),
    institutions: sortedInstitutionsForAutoselect()
  }
}

export const AccountFormComponent = ({
  classes,
  institutions,
  handleSubmit,
  values,
  handleChange,
  setFieldValue,
  handleDelete,
  handleCancel,
  account
}) => (
  <Grid container direction="row" justify="center">
    <Paper className={classes.root}>
      <div className={classes.formHeader}>
        <Typography variant="h6" align="center">
          {account ? 'Edit account' : 'New account'}
        </Typography>
        <IconButton aria-label="Close" className={classes.closeButton} onClick={handleCancel}>
          <CloseIcon />
        </IconButton>
      </div>
      <Divider />
      <form onSubmit={handleSubmit} className={classes.form}>
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
          autoFocus
        />
        <AutoComplete
          label="Institution"
          name="institution"
          value={values.institution}
          options={institutions}
          onChange={setFieldValue}
          className={classes.input}
        />
        <TextField
          type="number"
          label="Opening balance"
          inputProps={{
            'aria-label': 'Opening balance',
            required: true,
            maxLength: 10,
            min: Number.MIN_SAFE_INTEGER,
            max: Number.MAX_SAFE_INTEGER,
            step: 0.01
          }}
          className={classes.input}
          value={values.openingBalance}
          name="openingBalance"
          onChange={handleChange}
        />
        <TextField
          type="date"
          label="Opening Balance Date"
          InputLabelProps={{
            shrink: true,
            'aria-label': 'Date',
            required: true
          }}
          name="openingBalanceDate"
          className={classes.input}
          value={values.openingBalanceDate}
          onChange={handleChange}
        />

        {handleDelete &&
          <Button
            size="small"
            onClick={() => handleDelete(account)}
            className={classes.deleteButton}
          >
            Delete this account
          </Button>
        }
        <Divider />
        <div className={classes.formActions}>
          <Button type="submit" color="secondary">Save</Button>
        </div>
      </form>
    </Paper>
  </Grid>
)

AccountFormComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  institutions: PropTypes.array.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  handleDelete: PropTypes.func,
  handleCancel: PropTypes.func.isRequired,
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
    mapPropsToValues: ({ account }) => {
      if (account === undefined) {
        return {
          name: '',
          institution: null,
          openingBalance: 0,
          openingBalanceDate: format(Date.now(), 'YYYY-MM-DD')
        }
      }
      return {
        ...account,
        openingBalanceDate: format(new Date(account.openingBalanceDate), 'YYYY-MM-DD'),
        institution: {
          label: account.institution,
          value: account.institution
        }
      }
    },
    handleSubmit: (values, { props, setSubmitting }) => {
      setSubmitting(true)
      props.handleSave({
        ...values,
        institution: values.institution.value,
        openingBalanceDate: parse(values.openingBalanceDate).getTime()
      })
    }
  })
)(AccountFormComponent)
