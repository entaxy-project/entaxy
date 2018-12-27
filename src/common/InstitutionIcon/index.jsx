import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'

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

const importAll = (r) => {
  const images = {}
  r.keys().forEach((key) => {
    images[/\.\/(.*)\.\w{3}$/.exec(key)[1]] = r(key)
  })
  return images
}

const images = importAll(require.context('./logos', false, /\.(png|jpe?g|svg)$/))

const InstitutionIcon = ({ classes, institution, size }) => (
  <img src={`${images[institution]}`} alt={institution} className={classes[size]} />
)

InstitutionIcon.propTypes = {
  classes: PropTypes.object.isRequired,
  institution: PropTypes.string.isRequired,
  size: PropTypes.string.isRequired
}

export default withStyles(styles)(InstitutionIcon)
