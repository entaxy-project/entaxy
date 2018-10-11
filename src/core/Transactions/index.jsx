/* eslint no-console: 0 */
import React from 'react'
import _ from 'lodash'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import { NavLink } from 'react-router-dom'
import AddIcon from '@material-ui/icons/Add'
import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'
import format from 'date-fns/format'
import Header from '../../common/Header'
import TransactionDialog from './TransactionDialog'
import confirm from '../../util/confirm'
import { deleteTransaction, deleteAllTransactions } from '../../store/transactions/actions'

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    margin: '10px 5px',
    padding: '20px'
  },
  buttonsLeft: {
    float: 'left',
    display: 'inline-block'
  },
  buttonsRight: {
    float: 'right',
    display: 'inline-block'
  },
  button: {
    margin: theme.spacing.unit
  }
})

const mapStateToProps = (state) => {
  return {
    transactions: state.transactions
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleDelete: (transactionId) => {
      confirm('Delete transaction?', 'Are you sure?').then(() => {
        dispatch(deleteTransaction(transactionId))
      })
    },
    handleDeleteAll: () => {
      confirm('Delete ALL transaction?', 'Are you sure?').then(() => {
        dispatch(deleteAllTransactions())
      })
    }
  }
}

class Transactions extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
      transaction: null
    }
  }

  handleNew = () => {
    this.setState({ open: true, transaction: null })
  }

  handleEdit = (transaction) => {
    this.setState({ open: true, transaction })
  }

  handleCancel = () => {
    this.setState({ open: false })
  }

  render() {
    const currencyFormatter = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' })
    const {
      classes,
      transactions,
      handleDelete,
      handleDeleteAll
    } = this.props
    return (
      <div className={classes.root}>
        <Header />
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <div className={classes.buttonsLeft}>
                <TransactionDialog
                  open={this.state.open}
                  onCancel={this.handleCancel}
                  transaction={this.state.transaction}
                />
                <Button
                  variant="fab"
                  color="primary"
                  aria-label="New Transaction"
                  onClick={this.handleNew}
                >
                  <AddIcon />
                </Button>
                <Button
                  variant="extendedFab"
                  color="primary"
                  aria-label="Import Transactions"
                  className={classes.button}
                  component={NavLink}
                  to="/import-transactions"
                >
                  Import Transactions
                </Button>
              </div>
              <div className={classes.buttonsRight}>
                <Button
                  variant="extendedFab"
                  color="primary"
                  aria-label="Delete ALL Transactions"
                  className={classes.button}
                  onClick={handleDeleteAll}
                >
                  Delete ALL Transactions
                </Button>
              </div>
              <Typography variant="h5" gutterBottom align="center">Transactions</Typography>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>Institution</TableCell>
                    <TableCell>Account</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Ticker</TableCell>
                    <TableCell numeric>Shares</TableCell>
                    <TableCell numeric>BookValue</TableCell>
                    <TableCell numeric>Date</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {_.map(transactions, (transaction) => {
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.institution}</TableCell>
                        <TableCell>{transaction.account}</TableCell>
                        <TableCell>{transaction.type}</TableCell>
                        <TableCell>{transaction.ticker}</TableCell>
                        <TableCell numeric>{transaction.shares}</TableCell>
                        <TableCell numeric>{currencyFormatter.format(transaction.bookValue)}</TableCell>
                        <TableCell numeric>{format(transaction.createdAt, 'MMM do, YYYY @ h:mm a')}</TableCell>
                        <TableCell>
                          <IconButton
                            variant="fab"
                            color="primary"
                            aria-label="Edit Transaction"
                            onClick={() => this.handleEdit(transaction)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            variant="fab"
                            color="primary"
                            aria-label="Delete Transaction"
                            onClick={() => handleDelete(transaction.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
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
}

Transactions.propTypes = {
  classes: PropTypes.object.isRequired,
  transactions: PropTypes.array.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleDeleteAll: PropTypes.func.isRequired
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles)
)(Transactions)
