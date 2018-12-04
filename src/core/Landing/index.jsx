/* eslint-disable no-console */
import React from 'react'
import PropTypes from 'prop-types'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import LaptopIcon from '@material-ui/icons/Laptop'
import grey from '@material-ui/core/colors/grey'
import landingImage from './landing.png'
import blockstackLogo from './blockstack-bug-rounded.svg'
import { userLogin } from '../../store/user/actions'

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
  paper: {
    padding: '10px',
    margin: '10px 10px 20px 0',
    background: grey[200]
  },
  signingDescription: {
    padding: '10px 0 20px 0'
  },
  signinButton: {
    width: '100%'
  },
  right: {
    'background-repeat': 'no-repeat',
    'background-position': 'center',
    'background-size': '100%',
    'background-image': `url(${landingImage}), linear-gradient(to bottom, var(--color-blue), var(--color-cyan))`
  },
  blockstackTitle: {
    'background-repeat': 'no-repeat',
    'background-position': 'left',
    'background-size': '15px',
    'background-image': `url(${blockstackLogo})`,
    paddingLeft: '20px'
  },
  browserIcon: {
    fontSize: 19,
    marginBottom: -4,
    marginRight: 10
  }
})

const mapDispatchToProps = (dispatch) => {
  return {
    handleLogin: (loginType) => { dispatch(userLogin(loginType)) }
  }
}

export class LandingComponent extends React.Component {
  login = (loginType) => {
    this.props.handleLogin(loginType)
    this.props.history.push('/transactions')
  }

  render() {
    const { classes } = this.props
    return (
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
          <Grid container className={classes.cards}>
            <Typography color="secondary" variant="h5">
              Where do you want to store your data?
            </Typography>
            <Grid item xs={6}>
              <Paper elevation={1} className={classes.paper}>
                <Typography variant="subtitle2" className={classes.blockstackTitle}>
                  Anywhere with blockstack
                </Typography>
                <Typography variant="caption" className={classes.signingDescription}>
                  Keep your data encrypted and decentralized. Learn more about &nbsp;
                  <a href="https://blockstack.org/what-is-blockstack" target="_blank" rel="noopener noreferrer">
                    Blockstack
                  </a>
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  className={classes.signinButton}
                  onClick={() => this.login('blockstack')}
                >
                  Sign in with Blockstack
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper elevation={1} className={classes.paper}>
                <Typography variant="subtitle2">
                  <LaptopIcon className={classes.browserIcon} />
                  Locally in your browser
                </Typography>
                <Typography variant="caption" className={classes.signingDescription}>
                  Your data will be stored temporarily and it be removed once you close your browser
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  className={classes.signinButton}
                  onClick={() => this.login('guest')}
                >
                  Take it for a test drive
                </Button>
              </Paper>
            </Grid>
          </Grid>
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
  }
}

LandingComponent.propTypes = {
  history: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  handleLogin: PropTypes.func.isRequired
}

export default compose(
  connect(null, mapDispatchToProps),
  withStyles(styles)
)(LandingComponent)
