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

const InstitutionIcon = ({ classes, institution, size }) => (
  <img src={`${importLogos[institution]}`} alt={institution} className={classes[size]} />
)

InstitutionIcon.propTypes = {
  classes: PropTypes.object.isRequired,
  institution: PropTypes.string.isRequired,
  size: PropTypes.string.isRequired
}

export default withStyles(styles)(InstitutionIcon)
