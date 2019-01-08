import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import importLogos from './importLogos'

const styles = () => ({
  small: {
    width: 20,
    height: 20
  },
  medium: {
    width: 30,
    height: 30
  }
})

const InstitutionIcon = ({
  classes,
  className,
  institution,
  size
}) => (
  <img
    src={`${importLogos[institution]}`}
    alt={institution}
    className={`${[classes[size], className].join(' ')}`}
  />
)

InstitutionIcon.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  institution: PropTypes.string.isRequired,
  size: PropTypes.string.isRequired
}

InstitutionIcon.defaultProps = {
  className: undefined
}

export default withStyles(styles)(InstitutionIcon)
