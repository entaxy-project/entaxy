import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import Header from '../../../common/Header/index'

const styles = () => ({
  root: {
    flexGrow: 1
  },
  title: {
    margin: '10px 5px',
    padding: '20px'
  },
  dataSource: {
    height: '100px',
    margin: '10px 5px'
  }
})

const DataSources = ({ classes }) => (
  <div className={classes.root}>
    <Header />
    <Grid container spacing={0}>
      <Grid item xs={12}>
        <Typography className={classes.title} variant="headline" align="center">DataSources</Typography>
        <Grid container spacing={0}>
          <Grid item xs={4}>
            <Card className={classes.dataSource}>
              <CardHeader
                title="Questrade"
                subheader="Coming Soon"
              />
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card className={classes.dataSource}>
              <CardHeader
                title="RBC"
                subheader="Coming Soon"
              />
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </div>
)

DataSources.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(DataSources)

