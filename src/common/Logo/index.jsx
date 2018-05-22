import React from 'react'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'
import { Link } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import logoImg from './logo.png'

const styles = {
  logo: {
    display: 'flex'
  },
  image: {
    width: '30px',
    height: '30px',
    marginRight: '15px'
  },
  title: {
    textDecoration: 'none'
  }
}

const Logo = ({ classes }) => (
  <div className={classes.logo}>
    <img
      src={logoImg}
      className={classes.image}
      alt="Entaxy logo"
    />
    <Typography
      variant="title"
      color="inherit"
      className={classes.title}
      component={Link}
      to="/"
    >
      Entaxy
    </Typography>
  </div>
)

Logo.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Logo)
