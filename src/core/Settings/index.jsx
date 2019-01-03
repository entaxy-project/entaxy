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
import confirm from '../../util/confirm'
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
  handleSave: settings => dispatch(updateSettings(settings)),
  deleteAllData: async () => {
    await dispatch(resetState())
    await saveState()
  }
})

export class SettingsComponent extends React.Component {
  state = { openSnackbar: false }

  onSave = async (settings) => {
    await this.props.handleSave(settings)
    this.setState({ openSnackbar: true })
  }

  onReset = () => {
    confirm('Delete all your data? This cannot be undone.', 'Are you sure?').then(() => {
      this.props.deleteAllData().then(() => (
        this.props.history.push('/dashboard')
      ))
    })
  }

  onCancel = () => {
    this.props.history.push('/dashboard')
  }

  closeSnackbar = () => {
    this.setState({ openSnackbar: false })
  }

  render() {
    const {
      classes,
      deleteAllData
    } = this.props
    return (
      <Grid container direction="row" justify="center">
        <Paper className={classes.root}>
          <div className={classes.formHeader}>
            <Typography variant="h6" align="center">
              Settings
            </Typography>
            <IconButton aria-label="Close" className={classes.closeButton} onClick={this.onCancel}>
              <CloseIcon />
            </IconButton>
          </div>
          <Divider />
          <SettingsForm
            handleSave={this.onSave}
            handleReset={deleteAllData}
          />
        </Paper>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          open={this.state.openSnackbar}
          autoHideDuration={4000}
          onClose={this.closeSnackbar}
          ContentProps={{ 'aria-describedby': 'message-id' }}
          message={<span id="message-id">Your settings have been saved</span>}
        />
      </Grid>
    )
  }
}

SettingsComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSave: PropTypes.func.isRequired,
  deleteAllData: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
}

export default compose(
  connect(null, mapDispatchToProps),
  withStyles(styles)
)(SettingsComponent)
