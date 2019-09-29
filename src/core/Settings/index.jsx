import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Divider from '@material-ui/core/Divider'
import { updateSettings } from '../../store/settings/actions'
import { showSnackbar } from '../../store/user/actions'
import { resetState } from '../../store'
import SettingsForm from './form'
import confirm from '../../util/confirm'

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(2),
    padding: theme.spacing(2)
  },
  formHeader: {
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  closeButton: {
    marginTop: -10
  }
}))

const Settings = ({ history }) => {
  const classes = useStyles()
  const dispatch = useDispatch()

  const handleSave = async (settings) => {
    dispatch(updateSettings(settings))
    dispatch(showSnackbar({ text: 'Your settings have been saved', status: 'success' }))
    history.push('/dashboard')
  }

  const handleResetData = () => {
    confirm('Delete all your data? This cannot be undone.', 'Are you sure?').then(() => {
      dispatch(resetState())
      dispatch(showSnackbar({ text: 'All your data has been deleted', status: 'success' }))
      history.push('/dashboard')
    })
  }

  const handleCancel = () => {
    history.push('/dashboard')
  }

  return (
    <Grid container direction="row" justify="center">
      <Paper className={classes.root}>
        <div className={classes.formHeader}>
          <Typography variant="h6" align="center">
            Settings
          </Typography>
          <IconButton aria-label="Close" className={classes.closeButton} onClick={handleCancel}>
            <CloseIcon />
          </IconButton>
        </div>
        <Divider />
        <SettingsForm
          handleSave={handleSave}
          handleDeleteAllData={handleResetData}
        />
      </Paper>
    </Grid>
  )
}

Settings.propTypes = {
  history: PropTypes.object.isRequired
}

export default Settings
