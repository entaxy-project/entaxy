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
import Snackbar from '@material-ui/core/Snackbar'
import { updateSettings } from '../../store/settings/actions'
import { resetState, saveState } from '../../store/user/actions'
import SettingsForm from './form'

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
  }
})

const mapDispatchToProps = dispatch => ({
  saveSettings: settings => dispatch(updateSettings(settings)),
  deleteAllData: async () => {
    await resetState(dispatch)
    await saveState()
  }
})

export class SettingsComponent extends React.Component {
  state = { openSnackbar: false }

  handleSave = async (settings) => {
    await this.props.saveSettings(settings)
    this.setState({ openSnackbar: true })
  }

  handleResetData = async () => {
    this.props.deleteAllData()
    this.props.history.push('/dashboard')
  }

  handleCancel = () => {
    this.props.history.push('/dashboard')
  }

  handleCloseSnackbar = () => {
    this.setState({ openSnackbar: false })
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
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          open={this.state.openSnackbar}
          autoHideDuration={4000}
          onClose={this.handleCloseSnackbar}
          ContentProps={{ 'aria-describedby': 'message-id' }}
          message={<span id="message-id">Your settings have been saved</span>}
        />
      </Grid>
    )
  }
}

SettingsComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  saveSettings: PropTypes.func.isRequired,
  deleteAllData: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
}

export default compose(
  connect(null, mapDispatchToProps),
  withStyles(styles)
)(SettingsComponent)
