/* eslint no-console: 0 */
import React from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import ErrorIcon from '@material-ui/icons/Error'
import green from '@material-ui/core/colors/green'
import red from '@material-ui/core/colors/red'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

const styles = () => ({
  root: {
    padding: '20px'
  },
  formActions: {
    display: 'flex',
    'justify-content': 'flex-end',
    'padding-top': '10px'
  },
  iconCheck: {
    color: green[500],
    marginRight: '8px',
    'vertical-align': 'text-bottom'
  },
  iconError: {
    color: red[800],
    marginRight: '8px',
    'vertical-align': 'text-bottom'
  }
})

const ImportResults = ({
  classes,
  transactions,
  errors,
  onSave,
  onCancel
}) => {
  const transactionTotalErrorsCount = Object.keys(errors.transactions).length
  const transactionErrorsToDisplay = Math.min(10, transactionTotalErrorsCount)
  const transactionErrorKeys = Object.keys(errors.transactions).slice(0, transactionErrorsToDisplay)
  return (
    <div>
      {errors.base.length === 0 && transactionErrorsToDisplay === 0 &&
        <div className={classes.root}>
          <Typography variant="h6" align="center">
            <CheckCircleIcon className={classes.iconCheck} />
            Found {transactions.length} transactions
          </Typography>
        </div>
      }
      {errors.base.length &&
        <div className={classes.root}>
          <Typography variant="h6" align="center">
            <ErrorIcon className={classes.iconError} />
            Some problems were found with the file
          </Typography>
          <Typography variant="body2" align="center">
            {errors.base[0]}
          </Typography>
        </div>
      }
      {transactionErrorsToDisplay > 0 &&
        <div className={classes.root}>
          <Typography variant="h6" align="center">
            <ErrorIcon className={classes.iconError} />
            Found errors in {transactionTotalErrorsCount} transactions.
            Displaying top {transactionErrorsToDisplay} errors
          </Typography>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>Line</TableCell>
                <TableCell>Error</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {_.map(transactionErrorKeys, line => (
                <TableRow key={line}>
                  <TableCell>{line}</TableCell>
                  <TableCell>{errors.transactions[line][0]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      }
      <Divider />
      <div className={classes.formActions}>
        <Button onClick={onSave} color="secondary">Save Transactions</Button>
        <Button onClick={onCancel} color="secondary">Discard</Button>
      </div>
    </div>
  )
}

ImportResults.propTypes = {
  classes: PropTypes.object.isRequired,
  transactions: PropTypes.array.isRequired,
  errors: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
}

export default withStyles(styles)(ImportResults)
