import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import './rotating-icon.css'

const styles = {
  root: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
    padding: '1.2rem',
    display: 'flex',
    position: 'fixed',
    'overflow-y': 'auto',
    'overflow-x': 'hidden',
    'align-items': 'center',
    'justify-content': 'center',
    background: 'rgba(36, 123, 160, 0.7)'
  },
  label: {
    'margin-left': '20px',
    color: 'var(--color-white)',
    'font-weight': 'bold',
    'font-family': 'SW Garden Grove',
    'font-size': '24px'
  }
}

const mapStateToProps = ({ user }) => {
  return { isLoading: user.isLoading }
}

const LoadingOverlay = ({ classes, isLoading }) => {
  if (isLoading) {
    return (
      <div className={classes.root}>
        <div className="rotating-icon" />
        <div className={classes.label}>Loading ...</div>
      </div>
    )
  }
  return null
}

LoadingOverlay.propTypes = {
  classes: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired
}


export default connect(mapStateToProps)(withStyles(styles)(LoadingOverlay))
