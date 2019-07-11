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
import Avatar from '@material-ui/core/Avatar'
import grey from '@material-ui/core/colors/grey'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardActions from '@material-ui/core/CardActions'
import { loginAs } from '../../store/user/actions'
import blockstackLogo from './blockstack-bug-rounded.svg'
import LinkTo from '../../common/LinkTo'

const styles = {
  loggedOutContainer: {
    paddingTop: 20
  },
  loggedInContainer: {
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
}

const mapStateToProps = ({ user }) => {
  return { user }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleLogin: (loginType) => { dispatch(loginAs(loginType)) }
  }
}

export class LandingCardComponent extends React.Component {
  login = (loginType) => {
    this.props.handleLogin(loginType)
    this.props.history.push('/dashboard')
  }

  render() {
    const { classes, user } = this.props
    if (user.isAuthenticatedWith) {
      return (
        <Grid item xs={12} className={classes.loggedOutContainer}>
          <Typography variant="subtitle2">
            You are logged in as
          </Typography>
          <Card className={classes.card}>
            <CardHeader
              avatar={(
                <Avatar
                  src={user.pictureUrl}
                  alt={user.name}
                />
              )}
              title={user.name}
            />
            <CardActions>
              <Button
                size="small"
                color="secondary"
                component={LinkTo('/dashboard')}
              >
                Continue to your Dashboard
              </Button>
            </CardActions>
          </Card>
        </Grid>
      )
    }

    return (
      <Grid container className={classes.cards}>
        <Typography color="secondary" variant="h5">
          Where do you want to store your data?
        </Typography>
        <Grid item xs={6}>
          <Paper elevation={1} className={classes.loggedInContainer}>
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
          <Paper elevation={1} className={classes.loggedInContainer}>
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
    )
  }
}

LandingCardComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  handleLogin: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles)
)(LandingCardComponent)
