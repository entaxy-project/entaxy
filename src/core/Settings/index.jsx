import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Divider from '@material-ui/core/Divider'
import { updateSettings, showSnackbar } from '../../store/settings/actions'
import { resetState, saveState } from '../../store/user/actions'
import SettingsForm from './form'

const styles = theme => ({
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
})

const mapDispatchToProps = dispatch => ({
  saveSettings: settings => dispatch(updateSettings(settings)),
  showSnackbarMessage: message => dispatch(showSnackbar(message)),
  deleteAllData: async () => {
    await dispatch(resetState())
    await saveState()
  }
})

export class SettingsComponent extends React.Component {
  handleSave = async (settings) => {
    await this.props.saveSettings(settings)
    this.props.showSnackbarMessage({ text: 'Your settings have been saved', status: 'success' })
    this.props.history.push('/dashboard')
  }

  handleResetData = async () => {
    this.props.deleteAllData()
    this.props.history.push('/dashboard')
  }

  handleCancel = () => {
    this.props.history.push('/dashboard')
  }

  render() {
    const {
      classes
    } = this.props
    return (
      <Grid container direction="row" justify="center">
        <Paper className={classes.root}>
          <div className={classes.formHeader}>
            <Typography variant="h6" align="center">
              Settings
            </Typography>
            <IconButton aria-label="Close" className={classes.closeButton} onClick={this.handleCancel}>
              <CloseIcon />
            </IconButton>
          </div>
          <Divider />
          <SettingsForm
            handleSave={this.handleSave}
            handleDeleteAllData={this.handleResetData}
          />
        </Paper>
      </Grid>
    )
  }
}

SettingsComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  saveSettings: PropTypes.func.isRequired,
  showSnackbarMessage: PropTypes.func.isRequired,
  deleteAllData: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
}

export default compose(
  connect(null, mapDispatchToProps),
  withStyles(styles)
)(SettingsComponent)
