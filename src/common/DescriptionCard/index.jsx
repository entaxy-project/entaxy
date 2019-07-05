import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import InfolIcon from '@material-ui/icons/Info'

const styles = theme => ({
  card: {
    backgroundColor: theme.palette.info.background
  },
  icon: {
    float: 'left',
    color: theme.palette.info.text,
    marginRight: theme.spacing(1)
  }
})

const DescriptionCard = ({
  classes,
  className,
  children,
  actions,
  info
}) => (
  <Card className={[className, classes.card].join(' ')}>
    <CardContent className={classes.content}>
      { info && <InfolIcon className={classes.icon} />}
      {children}
    </CardContent>
    { actions && <CardActions>{actions}</CardActions> }
  </Card>
)

DescriptionCard.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  actions: PropTypes.node,
  info: PropTypes.bool
}

DescriptionCard.defaultProps = {
  className: undefined,
  actions: undefined,
  info: false
}

export default withStyles(styles)(DescriptionCard)
