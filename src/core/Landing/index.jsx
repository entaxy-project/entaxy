import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import Grid from 'material-ui/Grid'
import grey from 'material-ui/colors/grey'
import LandingCard from './LandingCard'
import landingImage from './landing.png'

const styles = () => ({
  root: {
    display: 'flex',
    height: '100vh',
    padding: '20px'
  },
  left: {
    'align-items': 'left',
    'justify-content': 'space-evenly',
    background: grey[100],
    padding: '2% 5% 2% 10%',
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
    'padding-top': '15px',
    'line-height': '1.6'

  },
  cards: {
    display: 'flex',
    'justify-content': 'space-evenly'
  },
  right: {
    'background-repeat': 'no-repeat',
    'background-position': 'center',
    'background-size': '100%',
    'background-image': `url(${landingImage}), linear-gradient(to bottom, var(--color-blue), var(--color-cyan))`
  }
})

const Landing = ({ classes }) => (
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
          without sacrificing your data.
        </div>
      </div>
      <Grid container className={classes.cards}>
        <LandingCard
          title="Income Taxes"
          description="At some point you will wonder how they work"
          path="/taxes"
        />
        <LandingCard
          title="Portfolio"
          description="ETFs, Crypto, etc"
          path="/portfolio"
        />
      </Grid>
    </Grid>
    <Grid item xs={6} className={classes.right} />
  </Grid>
)

Landing.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Landing)
