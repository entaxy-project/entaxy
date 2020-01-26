import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardHeader from '@material-ui/core/CardHeader'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Divider from '@material-ui/core/Divider'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import red from '@material-ui/core/colors/red'
import { updateSettings } from '../../store/settings/actions'
import { showSnackbar } from '../../store/user/actions'
import { resetState } from '../../store'
import SettingsForm from './form'
import ImportExport from './ImportExport'
import confirm from '../../util/confirm'

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(1)
  },
  formWrapper: {
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
  },
  deleteButton: {
    color: red[500]
  },
  deleteIcon: {
    marginRight: theme.spacing(1)
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
    <Grid container direction="row" justify="center" spacing={2} className={classes.root}>
      <Grid item xs={12} sm={6} md={4}>
        <Paper className={classes.formWrapper}>
          <div className={classes.formHeader}>
            <Typography variant="h6" align="center">
              Settings
            </Typography>
            <IconButton aria-label="Close" className={classes.closeButton} onClick={handleCancel}>
              <CloseIcon />
            </IconButton>
          </div>
          <Divider />
          <SettingsForm handleSave={handleSave} />
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <ImportExport history={history} />
        <Card className={classes.card}>
          <CardHeader
            title="Delete all your data"
            subheader="All your data will be deleted, reseting the app to its initial state,
            allowing you to start from scratch."
          />
          <CardActions>
            <Button onClick={handleResetData} className={classes.deleteButton}>
              <DeleteForeverIcon className={classes.deleteIcon} />
              Reset - delete all your data
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  )
}

Settings.propTypes = {
  history: PropTypes.object.isRequired
}

export default Settings
