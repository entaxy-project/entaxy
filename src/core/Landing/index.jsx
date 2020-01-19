import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import { useFeature } from 'flagged'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import Divider from '@material-ui/core/Divider'
import grey from '@material-ui/core/colors/grey'
import AOS from 'aos'
import 'aos/dist/aos.css'
import LandingCard from './LandingCard'
import Faqs from './Faqs'
import logoImg from '../../common/Logo/logo.png'
import image1 from './image1.png'
import image2 from './image2.png'
import image3 from './image3.png'
import image4 from './image4.png'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    padding: '20px',
    flexGrow: 1
  },
  tagLinePreTitle: {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    color: theme.palette.text.primary
  },
  tagLineTitle: {
    fontSize: '1.5rem'
  },
  tagLineText: {
    fontSize: 16,
    color: grey[600]
  },
  // --- Level 1
  level1: {
    justifyContent: 'space-evenly',
    background: grey[100],
    padding: theme.spacing(4),
    display: 'flex',
    flexFlow: 'column nowrap',
    paddingBottom: theme.spacing(8)
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

  // --- Other levels
  level: {
    justifyContent: 'space-evenly',
    '& div': {
      margin: theme.spacing(2),
      marginTop: theme.spacing(8),
      marginBottom: theme.spacing(8)
    }
  },
  greyBackground: {
    background: grey[200]
  },
  womanImage: {
    margin: 'auto',
    width: '80%'
  },
  faqs: {
    marginTop: theme.spacing(8)
  }
}))

const Landing = ({ history }) => {
  const classes = useStyles()
  const showFaqs = useFeature('showFaqs')

  useEffect(() => {
    AOS.init()
  }, [])

  return (
    <Grid container className={classes.root}>
      {/* --- Level 1 --- */}
      <Grid item xs={12} className={classes.level1}>
        <div className={classes.logoLevel1}>
          Entaxy
          <div className={classes.taglineLevel1}>Order from chaos</div>
        </div>
        <div className={classes.titleLevel1}>
          Your Personal Finances Simple & Private
          <Divider className={classes.titleDividerLevel1} />
          <Typography variant="body1" align="center">
            Insight into your finances without sacrificing your data
          </Typography>
        </div>
        <LandingCard history={history} />
      </Grid>

      {/* --- Level 2 --- */}
      <Grid container className={classes.level}>
        <Grid item xs={12} md={4} align="center">
          <img
            data-aos="zoom-out-right"
            src={image1} alt="Woman working on computer"
            className={classes.womanImage}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="caption" className={classes.tagLinePreTitle}>
            Privacy
          </Typography>
          <Typography variant="h5" paragraph className={classes.tagLineTitle}>
            A new breed of security
          </Typography>
          <Typography variant="body1" paragraph className={classes.tagLineText}>
            You are protected by state-of-the-art cryptography that keeps all your data private.
            Entaxy leverages the <Link href="https://blockstack.org/try-blockstack">Blockstack</Link>&nbsp;
            framework to bring you a&nbsp;
            <Link href="https://hackernoon.com/cant-be-evil-vs-don-t-be-evil-12fb625057b7">
              <em>Can&apos;t be evil</em>
            </Link>&nbsp;
            approach to software services.
          </Typography>
          <Typography variant="caption">
            Learn more about&nbsp;
            <Link href="https://blockstack.org/try-blockstack">
              <strong>Blockstack</strong>
            </Link>
          </Typography>
          <br />
          <Typography variant="caption">
            Learn more about&nbsp;
            <Link href="https://hackernoon.com/cant-be-evil-vs-don-t-be-evil-12fb625057b7">
              <strong>Can&apos;t be evil apps</strong>
            </Link>
          </Typography>
        </Grid>
      </Grid>

      {/* --- Level 3 --- */}
      <Grid container className={[classes.level, classes.greyBackground].join(' ')}>
        <Grid item xs={12} md={4}>
          <Typography variant="caption" className={classes.tagLinePreTitle}>
            Account consolidation
          </Typography>
          <Typography variant="h5" paragraph className={classes.tagLineTitle}>
            All your accounts in one place
          </Typography>
          <Typography variant="body1" paragraph className={classes.tagLineText}>
            One of the major problems with understanding your financial picture
            is everything you own is spread across many accounts at many institutions.
            Entaxy allows you to consolidate everthing in one place, all without giving away your data.
          </Typography>
        </Grid>
        <Grid item xs={12} md={4} align="center">
          <img data-aos="zoom-out-left" src={image2} alt="Woman working on computer" className={classes.womanImage} />
        </Grid>
      </Grid>

      {/* --- Level 4 --- */}
      <Grid container className={classes.level}>
        <Grid item xs={12} md={4} align="center">
          <img
            data-aos="zoom-out-right"
            src={image3} alt="Woman working on computer"
            className={classes.womanImage}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="caption" className={classes.tagLinePreTitle}>
            Budgeting
          </Typography>
          <Typography variant="h5" paragraph className={classes.tagLineTitle}>
            Budget in a way that works for you
          </Typography>
          <Typography variant="body1" paragraph className={classes.tagLineText}>
            Create budgets that work for you. Entaxy remembers your choices,
            meaning less work the more you use the app.
          </Typography>
        </Grid>
      </Grid>

      {/* --- Level 5 --- */}
      <Grid container className={[classes.level, classes.greyBackground].join(' ')}>
        <Grid item xs={12} md={4}>
          <Typography variant="caption" className={classes.tagLinePreTitle}>
            Insights
          </Typography>
          <Typography variant="h5" paragraph className={classes.tagLineTitle}>
            Visualize your data and learn from it
          </Typography>
          <Typography variant="body1" paragraph className={classes.tagLineText}>
            Once you see how your money is flowing, from your pay cheque to your loans
            and regular expenses, you will be able to quickly identify places where you
            can save money.
          </Typography>
        </Grid>
        <Grid item xs={12} md={4} align="center">
          <img
            data-aos="zoom-out-left"
            src={image4} alt="Woman working on computer"
            className={classes.womanImage}
          />
        </Grid>
      </Grid>
      {/* --- Faqs --- */}
      {showFaqs && (
        <Grid container justify="center" className={classes.faqs}>
          <Grid item xs={12} md={8} lg={6} align="center">
            <Typography variant="caption" className={classes.tagLinePreTitle}>
              How can we help you
            </Typography>
            <Typography variant="h5" paragraph className={classes.tagLineTitle}>
              Frequently Asked Questions
            </Typography>
            <Faqs />
          </Grid>
        </Grid>
      )}
    </Grid>
  )
}

Landing.propTypes = {
  history: PropTypes.object.isRequired
}

export default Landing
