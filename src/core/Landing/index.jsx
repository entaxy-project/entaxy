import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import grey from '@material-ui/core/colors/grey'
import logoImg from '../../common/Logo/logo.png'
import womanImg from './woman2.png'

import LandingCard from './LandingCard'
import landingImage from './landing.png'
import level20Image from './2.0.png'
import level21Image from './2.1.png'
import level30Image from './3.0.png'
import level31Image from './3.1.png'
import level32Image from './3.2.png'
import level33Image from './3.3.png'
import level40Image from './4.0.png'
import level41Image from './4.1.png'
import level50Image from './5.0.png'
import level51Image from './5.1.png'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    padding: '20px',
    flexGrow: 1
  },
  // --- Level 1
  level1: {
    justifyContent: 'space-evenly',
    background: grey[100],
    padding: theme.spacing(4),
    display: 'flex',
    flexFlow: 'column nowrap'
  },
  logoLevel1: {
    font: 'bold 24px var(--font-garden-grove)',
    color: 'black',
    background: `url(${logoImg}) no-repeat left center`,
    backgroundSize: 30,
    paddingLeft: 40
  },
  taglineLevel1: {
    font: 'italic 11px var(--font-garden-grove)',
    color: grey[500],
    paddingTop: 3
  },
  titleLevel1: {
    font: 'bold 46px var(--font-garden-grove)',
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      fontSize: 24
    }
  },
  titleDividerLevel1: {
    width: '20%',
    margin: `${theme.spacing(2)}px auto`,
    [theme.breakpoints.down('sm')]: {
      width: '50%'
    }
  },

  // --- Level 2
  womanImage: {
    margin: 'auto',
    width: '80%'
  },
  leftLevel2: {
    backgroundColor: 'var(--color-gradient2)'
  },
  rightLevel2: {
    minHeight: 550
  },
  backgroundImageLevel2: {
    position: 'absolute',
    left: theme.spacing(4),
    marginTop: theme.spacing(8),
    zIndex: 1
  },
  titleLevel2: {
    whiteSpace: 'noWrap',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 43,
    left: theme.spacing(1) * -1,
    paddingLeft: 250,
    paddingRight: theme.spacing(2),
    color: 'white',
    position: 'absolute',
    background: 'var(--color-gradient6)'
  },
  tagLineLevel2: {
    whiteSpace: 'noWrap',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 43,
    marginRight: theme.spacing(8),
    color: 'var(--color-gradient2)'
  },
  screenshotLevel2: {
    position: 'absolute',
    // width: '60%',
    right: theme.spacing(8),
    left: theme.spacing(8),
    marginTop: theme.spacing(6),
    padding: 5
  },
  // --- Level 3
  rightLevel3: {
    justifyContent: 'space-evenly',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '80% center',
    backgroundImage: `url(${level32Image})`,
    backgroundSize: '286px',
    backgroundColor: 'var(--color-gradient1)',
    minHeight: 550
  },
  titleLevel3: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: theme.spacing(5),
    marginLeft: theme.spacing(2) * -1,
    paddingLeft: '15%',
    background: `url(${level31Image}) no-repeat center top`,
    position: 'absolute',
    width: '100%',
    lineHeight: '53px'
  },
  tagLineLevel3: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: theme.spacing(3) * -1,
    right: theme.spacing(2) * -1,
    color: 'white',
    width: 500,
    position: 'absolute',
    background: `var(--color-gradient2) url(${level33Image}) no-repeat 200px center`,
    padding: `5px ${theme.spacing(10)}px 5px 200px`
  },
  screenshotLevel3: {
    position: 'absolute',
    width: '60%',
    left: theme.spacing(8),
    marginTop: theme.spacing(16),
    padding: 5
  },
  // --- Level 4
  leftLevel4: {
    backgroundColor: 'var(--color-gradient2)'
  },
  rightLevel4: {
    minHeight: 600
  },
  backgroundImageLevel4: {
    position: 'absolute',
    left: theme.spacing(1) * -1,
    marginTop: theme.spacing(5)
  },
  titleLeftLevel4: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: theme.spacing(3),
    marginLeft: 100,
    paddingLeft: 100,
    lineHeight: '91px',
    position: 'absolute',
    background: `url(${level41Image}) no-repeat left center`
  },
  tagLineLevel4: {
    whiteSpace: 'noWrap',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 43,
    marginRight: theme.spacing(8),
    color: 'var(--color-gradient2)'
  },
  screenshotLevel4: {
    position: 'absolute',
    width: '60%',
    right: theme.spacing(16),
    marginTop: theme.spacing(4),
    padding: 5
  },
  // --- Level 5
  titleLevel5: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: theme.spacing(5),
    marginLeft: theme.spacing(2) * -1,
    paddingLeft: '15%',
    position: 'absolute',
    width: '100%',
    lineHeight: '53px'
  },
  tagLineLevel5: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: theme.spacing(3) * -1,
    right: theme.spacing(2) * -1,
    color: 'white',
    width: 500,
    position: 'absolute',
    background: 'var(--color-gradient2)',
    padding: `5px ${theme.spacing(10)}px 5px ${theme.spacing(2)}px`
  },

  rightLevel5: {
    justifyContent: 'space-evenly',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '80% center',
    backgroundSize: '286px',
    backgroundColor: 'var(--color-gradient1)',
    minHeight: 550
  },
  screenshotLevel5: {
    position: 'absolute',
    width: '65%',
    left: 180,
    marginTop: theme.spacing(12),
    padding: 5
  },
  backgroundImageLevel5: {
    position: 'absolute',
    right: '15%',
    marginTop: 180,
    width: 150
  }
}))

const Landing = ({ history }) => {
  const classes = useStyles()
  return (
    <Grid container spacing={0} className={classes.root}>
      {/* --- Level 1 --- */}
      <Grid item xs={12} className={classes.level1}>
        <div className={classes.logoLevel1}>
          Entaxy
          <div className={classes.taglineLevel1}>Order from chaos</div>
        </div>
        <div className={classes.titleLevel1}>
          Your Personal Finances Simple & Private
          <Typography variant="body1" align="center">
            <Divider className={classes.titleDividerLevel1} />
            Insight into your finances without sacrificing your data
          </Typography>
        </div>
        <LandingCard history={history} />
      </Grid>
      <Grid container justify="center">
        <Grid item xs={12} md={4} align="center">
          <img src={womanImg} alt="Woman working on computer" className={classes.womanImage}/>
        </Grid>
        <Grid item xs={12} md={4} align="center">
          <Typography variant="h5" align="center">
            Account management
          </Typography>
          <Typography variant="h5" align="center">
            Budgeting
          </Typography>
          <Typography variant="h5" align="center">
            Multiple currencies
          </Typography>
          <Typography variant="body1" align="center">
            Entaxy runs exclusively on your devide
          </Typography>
        </Grid>
      </Grid>
      {/* --- Level 2 ---
      <div style={{ position: 'relative' }}>
        <Grid item xs={6} className={classes.leftLevel2}>
          <Typography variant="h5" className={classes.titleLevel2}>
            All your accounts
          </Typography>
          <img src={level21Image} className={classes.backgroundImageLevel2} alt="Your Accounts backgoround" />
        </Grid>
        <Grid item xs={6} className={classes.rightLevel2}>
          <Typography variant="h5" align="right" className={classes.tagLineLevel2}>
            in one place
          </Typography>
          <Paper className={classes.screenshotLevel2}>
            <img src={level20Image} width="100%" alt="Your Accounts" />
          </Paper>
        </Grid>
      {/* --- Level 3 ---
      <Grid item xs={6}>
        <Typography variant="h5" className={classes.titleLevel3}>
          Your financial data
        </Typography>
        <Paper className={classes.screenshotLevel3}>
          <img src={level30Image} width="100%" alt="Your Transactions" />
        </Paper>
      </Grid>
      <Grid item xs={6} className={classes.rightLevel3}>
        <Typography variant="h5" align="right" className={classes.tagLineLevel3}>
          owned by you
        </Typography>
      </Grid>
      {/* --- Level 4 ---
      <Grid item xs={6} className={classes.leftLevel4}>
        <Typography variant="h5" className={classes.titleLeftLevel4}>
          Budget
        </Typography>
      </Grid>
      <Grid item xs={6} className={classes.rightLevel4}>
        <Typography variant="h5" align="right" className={classes.tagLineLevel4}>
        in a way that works for you
        </Typography>
        <Paper className={classes.screenshotLevel4}>
          <img src={level40Image} width="100%" alt="Budget the way you like" />
        </Paper>
      </Grid>
      {/* --- Level 5 ---
      <Grid item xs={6}>
        <Typography variant="h5" className={classes.titleLevel5}>
          Visualize your data
        </Typography>
        <Paper className={classes.screenshotLevel5}>
          <img src={level50Image} width="100%" alt="Learn from your data" />
        </Paper>
        <img src={level51Image} width="100%" alt="Woman drawing" className={classes.backgroundImageLevel5} />
      </Grid>
      <Grid item xs={6} className={classes.rightLevel5}>
        <Typography variant="h5" className={classes.tagLineLevel5}>
          and learn from it
        </Typography>
      </Grid>
      */}
    </Grid>
  )
}

Landing.propTypes = {
  history: PropTypes.object.isRequired
}

export default Landing
