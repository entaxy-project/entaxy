import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import grey from '@material-ui/core/colors/grey'
import LandingCard from './LandingCard'
import landingImage from './landing.png'

const styles = () => ({
  root: {
    display: 'flex',
    height: '100vh',
    padding: '20px',
    minHeight: 600
  },
  left: {
    'align-items': 'left',
    'justify-content': 'space-evenly',
    background: grey[100],
    padding: '2% 5% 2% 8%',
    display: 'flex',
    'flex-flow': 'column nowrap'
  },
  logo: {
    font: 'bold 24px var(--font-garden-grove)',
    color: 'black'
  },
  tagline: {
    font: 'italic 11px var(--font-garden-grove)',
    color: grey[500],
    'padding-top': '3px'
  },
  title: {
    font: 'bold 48px var(--font-garden-grove)',
    'line-height': '1.2'

  },
  description: {
    font: '18px var(--font-garden-grove)',
    paddingTop: '15px',
    lineHeight: '1.6',
    color: grey[600]
  },
  right: {
    'background-repeat': 'no-repeat',
    'background-position': 'center',
    'background-size': '100%',
    'background-image': `url(${landingImage}), linear-gradient(to bottom, var(--color-blue), var(--color-cyan))`
  }
})

export const LandingComponent = ({ classes, history }) => (
  <Grid container spacing={0} className={classes.root}>
    <Grid item xs={6} className={classes.left}>
      <div className={classes.logo}>
        Entaxy
        <div className={classes.tagline}>Order from chaos</div>
      </div>
      <div className={classes.title}>
        Your Personal Finance Simple & Private
        <div className={classes.description}>
          Insights into your finances,
          without sacrificing your data
        </div>
      </div>
      <LandingCard history={history} />
      <div>
        <Typography variant="body2">
          Entaxy is free and you get to keep your data.
        </Typography>
        <Typography variant="body2">
          That&apos;s right, we
          don&apos;t store your data in a big database so we
          don&apos;t need to convince you to trust us.
        </Typography>
      </div>
    </Grid>
    <Grid item xs={6} className={classes.right} />
  </Grid>
)
LandingComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
}

export default withStyles(styles)(LandingComponent)
