import React from 'react'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'
import { Link } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import logoImg from './logo.png'
import LinkTo from '../LinkTo'

const styles = {
  logo: {
    display: 'flex',
    minWidth: 135
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
    <Link to="/">
      <img
        src={logoImg}
        className={classes.image}
        alt="Entaxy logo"
      />
    </Link>
    <Typography
      variant="h6"
      color="inherit"
      className={classes.title}
      component={LinkTo('/')}
    >
      Entaxy
    </Typography>
  </div>
)

Logo.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Logo)
