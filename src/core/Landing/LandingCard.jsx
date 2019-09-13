import React from 'react'
import PropTypes from 'prop-types'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Avatar from '@material-ui/core/Avatar'
import grey from '@material-ui/core/colors/grey'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardActions from '@material-ui/core/CardActions'
import { loginAs } from '../../store'
import blockstackLogo from './blockstack-bug-rounded.svg'
import LinkTo from '../../common/LinkTo'

const styles = (theme) => ({
  loggedOutContainer: {
    padding: theme.spacing(1),
    marginRight: theme.spacing(2),
    background: grey[200]
  },
  signingDescription: {
    textAlign: 'center',
    display: 'inline-block',
    padding: theme.spacing(2)
  },
  signinButton: {
    width: '100%'
  },
  blockstackTitle: {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'left',
    backgroundSize: '15px',
    backgroundImage: `url(${blockstackLogo})`,
    paddingLeft: '20px',
    '& a': {
      color: theme.palette.action.active
    }
  },
  browserIcon: {
    fontSize: 19,
    marginBottom: -4,
    marginRight: 10
  }
})

const mapStateToProps = ({ user }) => {
  return { user }
}

export class LandingCardComponent extends React.Component {
  login = (loginType) => {
    loginAs(loginType)
    this.props.history.push('/dashboard')
  }

  render() {
    const { classes, user } = this.props
    if (user.isAuthenticatedWith) {
      return (
        <Grid container>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                avatar={<Avatar src={user.pictureUrl} alt={user.name} />}
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
        </Grid>
      )
    }

    return (
      <Grid container>
        <Grid item xs={6}>
          <Paper elevation={1} className={classes.loggedOutContainer}>
            <Button
              variant="contained"
              color="secondary"
              className={classes.signinButton}
              onClick={() => this.login('blockstack')}
              data-testid="signinWithBlockstackButton"
            >
              Sign in with Blockstack
            </Button>
            <Typography variant="caption" align="center" className={classes.signingDescription}>
              Keep your data encrypted and decentralized. Learn more about &nbsp;
              <span className={classes.blockstackTitle}>
                <a href="https://blockstack.org/what-is-blockstack" target="_blank" rel="noopener noreferrer">
                  Blockstack
                </a>
              </span>
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper elevation={1} className={classes.loggedOutContainer}>
            <Button
              variant="contained"
              color="secondary"
              className={classes.signinButton}
              onClick={() => this.login('guest')}
              data-testid="signinAsGuestButton"
            >
              Don&apos;t sign in yet
            </Button>
            <Typography variant="caption" className={classes.signingDescription}>
              You can use the app fully but your data will not be stored.
              <br />
              Single session
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    )
  }
}

LandingCardComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
}

export default compose(
  connect(mapStateToProps),
  withStyles(styles)
)(LandingCardComponent)
