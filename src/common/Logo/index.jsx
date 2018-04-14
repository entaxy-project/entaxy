import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import logoImg from './logo.png'

const styles = {
  logo: {
    width: '30px',
    marginRight: '15px'
  }
}

const Logo = ({ classes }) => (
  <img
    src={logoImg}
    className={classes.logo}
    alt="Entaxy logo"
  />
)

Logo.propTypes = {
  classes: PropTypes.string.isRequired
}

export default withStyles(styles)(Logo)
