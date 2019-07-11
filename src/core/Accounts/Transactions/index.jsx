import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import IconButton from '@material-ui/core/IconButton'
import EditIcon from '@material-ui/icons/Edit'
import Tooltip from '@material-ui/core/Tooltip'
import { Column } from 'react-virtualized'
import 'react-virtualized/styles.css'
import TransactionDialog from './TransactionDialog'
import TransactionsTable from './TransactionsTable'
import TransactionsToolbar from './TransactionsToolbar'
import { deleteTransactions } from '../../../store/transactions/actions'

const styles = {
  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: 'calc(100vh - 170px)'
  },
  tableButton: {
    padding: 4
  },
  smallIcon: {
    fontSize: 18
  }
}

const mapStateToProps = (state, props) => ({
  account: state.accounts.byId[props.match.params.accountId],
  transactions: state.transactions.list
})

const mapDispatchToProps = dispatch => ({
  deleteTransactions: (account, transactionIds) => dispatch(deleteTransactions(account, transactionIds))
})

export class TransactionsComponent extends React.Component {
  state = {
    openTransactionDialog: false,
    transaction: null
  }

  accountTransactions = () => {
    const { account, transactions } = this.props
    const openingBalanceTransaction = {
      accountId: account.id,
      description: 'Opening balance',
      amount: account.openingBalance,
      createdAt: account.openingBalanceDate
    }
    return [openingBalanceTransaction, ...transactions].filter(transaction => (
      transaction.accountId === account.id
    ))
  }

  handleNew = () => {
    this.setState({
      openTransactionDialog: true,
      transaction: null
    })
  }

  handleEdit = (transaction) => {
    this.setState({
      openTransactionDialog: true,
      transaction
    })
  }

  handleCancel = () => {
    this.setState({ openTransactionDialog: false })
  }

  render() {
    const {
      classes,
      account
    } = this.props
    return (
      <div>
        <TransactionDialog
          open={this.state.openTransactionDialog}
          onCancel={this.handleCancel}
          account={account}
          transaction={this.state.transaction}
        />
        <TransactionsTable
          className={classes.tableWrapper}
          account={account}
          transactions={this.accountTransactions()}
          Toolbar={TransactionsToolbar}
          toolbarProps={{
            handleNew: this.handleNew,
            handleDelete: this.props.deleteTransactions
          }}
        >
          <Column
            width={40}
            dataKey="index"
            disableSort={true}
            cellRenderer={
              ({ rowData }) => rowData.id !== undefined && (
                <Tooltip title="Edit transaction">
                  <IconButton
                    disableRipple={true}
                    aria-label="Edit Transaction"
                    onClick={() => this.handleEdit(rowData)}
                    className={classes.tableButton}
                  >
                    <EditIcon className={classes.smallIcon} />
                  </IconButton>
                </Tooltip>
              )
            }
          />
        </TransactionsTable>
      </div>
    )
  }
}

TransactionsComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  transactions: PropTypes.array.isRequired,
  deleteTransactions: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles)
)(TransactionsComponent)
