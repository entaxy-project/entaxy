import React from 'react'
import PropTypes from 'prop-types'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import Snackbar from '@material-ui/core/Snackbar'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import ErrorIcon from '@material-ui/icons/Error'
import { hideSnackbar } from '../../store/settings/actions'

const styles = (theme) => ({
  message: {
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    fontSize: 20,
    opacity: 0.9,
    marginRight: theme.spacing(2)
  },
  success: {
    color: theme.palette.success.icon
  },
  error: {
    color: theme.palette.danger.icon
  }
})

const mapStateToProps = ({ settings }) => {
  return { settings }
}

const mapDispatchToProps = (dispatch) => ({
  handleCloseSnackbar: () => { dispatch(hideSnackbar()) }
})

const SnackbarMessage = ({ classes, settings, handleCloseSnackbar }) => (
  <Snackbar
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    open={settings.snackbarMessage !== null}
    onClose={handleCloseSnackbar}
    autoHideDuration={4000}
    ContentProps={{ 'aria-describedby': 'message-id' }}
    message={(
      <span id="message-id" className={classes.message}>
        {settings.snackbarMessage && settings.snackbarMessage.status === 'success' && (
          <CheckCircleIcon className={[classes.icon, classes.success].join(' ')} />
        )}
        {settings.snackbarMessage && settings.snackbarMessage.status === 'error' && (
          <ErrorIcon className={[classes.icon, classes.error].join(' ')} />
        )}
        {settings.snackbarMessage && settings.snackbarMessage.text}
      </span>
    )}
  />
)
SnackbarMessage.propTypes = {
  classes: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  handleCloseSnackbar: PropTypes.func.isRequired
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles)
)(SnackbarMessage)
