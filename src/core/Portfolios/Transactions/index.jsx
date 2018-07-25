import React from 'react'
import _ from 'lodash'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Header from '../../../common/Header/index'

const styles = {
  root: {
    flexGrow: 1
  },
  paper: {
    margin: '10px 5px',
    padding: '20px'
  }
}

const mapStateToProps = ({ transactions }) => {
  return { transactions }
}

const Transactions = ({ classes, transactions }) => {
  const currencyFormatter = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' })

  return (
    <div className={classes.root}>
      <Header />
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>Source</TableCell>
                  <TableCell>Ticker</TableCell>
                  <TableCell numeric>Shares</TableCell>
                  <TableCell numeric>Price</TableCell>
                  <TableCell numeric>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {_.map(transactions, (transaction) => {
                  return (
                    <TableRow>
                      <TableCell>{transaction.source}</TableCell>
                      <TableCell>{transaction.ticker}</TableCell>
                      <TableCell numeric>{transaction.shares}</TableCell>
                      <TableCell numeric>{currencyFormatter.format(transaction.price)}</TableCell>
                      <TableCell numeric>{transaction.date}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

Transactions.propTypes = {
  classes: PropTypes.object.isRequired,
  transactions: PropTypes.array.isRequired
}

export default compose(
  connect(mapStateToProps),
  withStyles(styles)
)(Transactions)
