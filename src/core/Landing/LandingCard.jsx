import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Avatar from '@material-ui/core/Avatar'
import grey from '@material-ui/core/colors/grey'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardActions from '@material-ui/core/CardActions'
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew'
import { loginAs, userLogout } from '../../store'
import blockstackLogo from './blockstack-bug-rounded.svg'
import LinkTo from '../../common/LinkTo'

const useStyles = makeStyles((theme) => ({
  loggedOutContainer: {
    padding: theme.spacing(1),
    background: grey[200]
  },
  signinButton: {
    width: '100%',
    marginBottom: theme.spacing(3)
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
  },
  logoutIcon: {
    fontSize: 16,
    marginRight: theme.spacing(1)
  },
  logoutButton: {
    marginLeft: 'auto',
    whiteSpace: 'nowrap'
  }
}))

export const LandingCardComponent = ({ history }) => {
  const classes = useStyles()
  const user = useSelector((state) => state.user)

  const login = (loginType) => {
    loginAs(loginType)
    history.push('/dashboard')
  }

  if (user.isAuthenticatedWith) {
    return (
      <Grid container justify="center">
        <Grid item xs={12} sm={8} md={6} lg={4}>
          <Card>
            <CardHeader
              avatar={<Avatar src={user.pictureUrl} alt={user.name} />}
              title={user.name}
            />
            <CardActions disableSpacing>
              <Button
                size="small"
                color="secondary"
                component={LinkTo('/dashboard')}
              >
                Continue to your Dashboard
              </Button>
              <Button
                size="small"
                color="secondary"
                onClick={userLogout}
                className={classes.logoutButton}
              >
                <PowerSettingsNewIcon className={classes.logoutIcon} />
                Sign out
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={2} justify="center">
      <Grid item xs={12} md={4}>
        <Paper elevation={1} className={classes.loggedOutContainer}>
          <Button
            variant="contained"
            color="secondary"
            className={classes.signinButton}
            onClick={() => login('blockstack')}
            data-testid="signinWithBlockstackButton"
          >
            Sign in with Blockstack
          </Button>
          <Typography variant="caption" paragraph align="center">
            Keep your data encrypted and decentralized.
            <br />Learn more about &nbsp;
            <span className={classes.blockstackTitle}>
              <a href="https://blockstack.org/what-is-blockstack" target="_blank" rel="noopener noreferrer">
                Blockstack
              </a>
            </span>
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper elevation={1} className={classes.loggedOutContainer}>
          <Button
            variant="contained"
            color="secondary"
            className={classes.signinButton}
            onClick={() => login('guest')}
            data-testid="signinAsGuestButton"
          >
            Sign in as guest user
          </Button>
          <Typography variant="caption" paragraph align="center">
            Your data will be stored on this browser only.
            <br />Great for exploring the app.
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  )
}

LandingCardComponent.propTypes = {
  history: PropTypes.object.isRequired
}

export default LandingCardComponent
