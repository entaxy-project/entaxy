import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector, useDispatch } from 'react-redux'
import Snackbar from '@material-ui/core/Snackbar'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import ErrorIcon from '@material-ui/icons/Error'
import { hideSnackbar } from '../../store/user/actions'

const useStyles = makeStyles((theme) => ({
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
}))

const SnackbarMessage = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const snackbarMessage = useSelector(({ user }) => user.snackbarMessage)

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      open={snackbarMessage !== null}
      onClose={() => dispatch(hideSnackbar())}
      autoHideDuration={4000}
      ContentProps={{ 'aria-describedby': 'message-id' }}
      data-testid="snackback"
      message={(
        <span id="message-id" className={classes.message}>
          {snackbarMessage && snackbarMessage.status === 'success' && (
            <CheckCircleIcon className={[classes.icon, classes.success].join(' ')} data-testid="successIcon" />
          )}
          {snackbarMessage && snackbarMessage.status === 'error' && (
            <ErrorIcon className={[classes.icon, classes.error].join(' ')} data-testid="errorIcon" />
          )}
          {snackbarMessage && snackbarMessage.text}
        </span>
      )}
    />
  )
}

export default SnackbarMessage
