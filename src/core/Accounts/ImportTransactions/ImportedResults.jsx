import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import ErrorIcon from '@material-ui/icons/Error'
import Tooltip from '@material-ui/core/Tooltip'
import green from '@material-ui/core/colors/green'
import red from '@material-ui/core/colors/red'
import { Column } from 'react-virtualized'
import ResultsToolbar from './ResultsToolbar'
import TransactionsTable from '../Transactions/TransactionsTable'

const styles = {
  tableWrapper: {
    height: 'calc(100vh - 350px)',
    marginBottom: 100
  },
  formActions: {
    display: 'flex',
    'justify-content': 'flex-end',
    'padding-top': '10px'
  },
  iconCheck: {
    color: green[500],
    marginRight: '8px',
    'vertical-align': 'text-bottom',
    fontSize: 18
  },
  iconError: {
    color: red[800],
    marginRight: '8px',
    'vertical-align': 'text-bottom',
    fontSize: 18
  }
}

export class ImportedResultsComponent extends React.Component {
  filterByErrors = transaction => (
    Object.keys(transaction).includes('errors') && transaction.errors.length > 0
  )

  toolbarProps = () => {
    const { transactions, classes } = this.props
    const transactionsWithErrors = transactions.filter(this.filterByErrors)
    let subTitle = 'No errors'

    if (transactionsWithErrors.length > 0) {
      subTitle = (
        <div>
          <ErrorIcon className={classes.iconError} />
          {transactionsWithErrors.length}
          transactions have errors and will not be imported
        </div>
      )
    }

    return {
      title: `Found ${transactions.length} transactions`,
      subTitle
    }
  }

  errorCellRenderer = ({ cellData }) => {
    const { classes } = this.props
    if (cellData.length === 0) {
      return <CheckCircleIcon className={classes.iconCheck} />
    }
    return (
      <Tooltip title={cellData}>
        <ErrorIcon className={classes.iconError} />
      </Tooltip>
    )
  }

  render() {
    const {
      classes,
      account,
      transactions,
      errors,
      onSave,
      onBack
    } = this.props

    return (
      <div>
        <TransactionsTable
          className={classes.tableWrapper}
          account={account}
          transactions={transactions}
          hideChekboxes
          Toolbar={ResultsToolbar}
          toolbarProps={this.toolbarProps()}
        >
          <Column
            width={20}
            disableSort={true}
            dataKey="errors"
            cellRenderer={this.errorCellRenderer}
          />
        </TransactionsTable>
        <Divider />
        <div className={classes.formActions}>
          <Button
            onClick={onSave}
            color="secondary"
            disabled={errors.base.length > 0}
          >
            Save Transactions
          </Button>
          <Button onClick={onBack} color="secondary">Back</Button>
        </div>
      </div>
    )
  }
}

ImportedResultsComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  account: PropTypes.object.isRequired,
  transactions: PropTypes.array.isRequired,
  errors: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired
}

export default withStyles(styles)(ImportedResultsComponent)
