import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import IconButton from '@material-ui/core/IconButton'
import EditIcon from '@material-ui/icons/Edit'
import Tooltip from '@material-ui/core/Tooltip'
import { Column } from 'react-virtualized'
import 'react-virtualized/styles.css'
import TransactionDialog from './TransactionDialog'
import TransactionsTable from './TransactionsTable'
import TransactionsToolbar from './TransactionsToolbar'
import { deleteTransactions, createTransaction, updateTransaction } from '../../../store/transactions/actions'
import confirm from '../../../util/confirm'

const useStyles = makeStyles(() => ({
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
}))

const Transactions = ({ match }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { account, transactions } = useSelector((state) => {
    return {
      account: state.accounts.byId[match.params.accountId],
      transactions: state.transactions.list.filter((transaction) => (
        transaction.accountId === match.params.accountId
      ))
    }
  })
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  const accountTransactions = () => {
    const openingBalanceTransaction = {
      accountId: account.id,
      description: 'Opening balance',
      amount: {
        accountCurrency: account.openingBalance,
        localCurrency: null
      },
      createdAt: account.openingBalanceDate,
      type: 'openingBalance'
    }
    return [openingBalanceTransaction, ...transactions]
  }

  const handleNew = () => {
    setOpenTransactionDialog(true)
    setSelectedTransaction(null)
  }

  const handleEdit = (transaction) => {
    setOpenTransactionDialog(true)
    setSelectedTransaction(transaction)
  }

  const handleCancel = () => {
    setOpenTransactionDialog(false)
    setSelectedTransaction(null)
  }

  const handleSaveTransaction = (transaction, options) => {
    handleCancel()
    if ('id' in transaction) {
      return dispatch(updateTransaction(account, transaction, options))
    }
    return dispatch(createTransaction(account, transaction, options))
  }

  const handleDeleteTransaction = () => (
    confirm('Delete this transaction?', 'Are you sure?').then(() => {
      dispatch(deleteTransactions(account, [selectedTransaction.id]))
      setOpenTransactionDialog(false)
    })
  )

  const handleDeleteTransactions = (transactionIds) => (
    dispatch(deleteTransactions(account, transactionIds))
  )

  return (
    <div>
      <TransactionDialog
        open={openTransactionDialog}
        onCancel={handleCancel}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        account={account}
        transaction={selectedTransaction}
      />
      <TransactionsTable
        allowClickOnRow
        className={classes.tableWrapper}
        account={account}
        transactions={accountTransactions()}
        Toolbar={TransactionsToolbar}
        toolbarProps={{ handleNew, handleEdit, handleDelete: handleDeleteTransactions }}
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
                  onClick={() => handleEdit(rowData)}
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

Transactions.propTypes = {
  match: PropTypes.object.isRequired
}

export default Transactions
