import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import IconButton from '@material-ui/core/IconButton'
import ArrowForward from '@material-ui/icons/ArrowForward'

const styles = {
  card: {
    'margin-top': '20px',
    'flex-grow': 1
  },
  cardButton: {
    'margin-top': '10px'
  }
}

const LandingCard = ({
  classes,
  title,
  description,
  path
}) => (
  <Card className={classes.card}>
    <CardHeader
      title={title}
      subheader={description}
      action={
        <IconButton
          variant="fab"
          color="secondary"
          className={classes.cardButton}
          component={Link}
          to={path}
        >
          <ArrowForward />
        </IconButton>
      }
    />
  </Card>
)

LandingCard.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired
}

export default withStyles(styles)(LandingCard)
