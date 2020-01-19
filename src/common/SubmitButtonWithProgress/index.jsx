import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import green from '@material-ui/core/colors/green'

const styles = (theme) => ({
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative'
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
})

const SubmitButtonWithProgress = ({
  classes,
  className,
  label,
  isSubmitting
}) => {
  return (
    <div className={[classes.wrapper, className].join(' ')}>
      <Button
        type="submit"
        color="secondary"
        disabled={isSubmitting}
        disableFocusRipple={true}
      >
        {label}
      </Button>
      {isSubmitting && <CircularProgress size={24} className={classes.buttonProgress} />}
    </div>
  )
}

SubmitButtonWithProgress.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  label: PropTypes.string.isRequired,
  isSubmitting: PropTypes.bool.isRequired
}

SubmitButtonWithProgress.defaultProps = {
  className: null
}
export default withStyles(styles)(SubmitButtonWithProgress)
