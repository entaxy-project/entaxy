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
import { makeAccountTransactions } from '../../../store/transactions/selectors'

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

// https://medium.com/@parkerdan/react-reselect-and-redux-b34017f8194c
const makeMapStateToProps = () => {
  const accountTransactions = makeAccountTransactions()
  const mapStateToProps = (state, props) => ({
    account: state.accounts.byId[props.match.params.accountId],
    transactions: accountTransactions(state, props).transactions
  })
  return mapStateToProps
}

const mapDispatchToProps = dispatch => ({
  deleteTransactions: (account, transactionIds) => dispatch(deleteTransactions(account, transactionIds))
})

export class TransactionsComponent extends React.Component {
  state = {
    openTransactionDialog: false,
    transaction: null
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
      transactions,
      account
    } = this.props
<<<<<<< HEAD
    const { selected } = this.state
    const rowHeight = account.type === 'wallet' ? 42 : 30
=======
>>>>>>> Added import transaction preview
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
          transactions={transactions}
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
              ({ rowData }) => (
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
<<<<<<< HEAD
          <div className={classes.tableWrapper}>
            <AutoSizer>
              {({ width, height }) => (
                <Table
                  width={width}
                  height={height}
                  headerHeight={25}
                  rowHeight={rowHeight}
                  rowClassName={index => this.rowClassName(index, classes)}
                  rowCount={transactions.length}
                  rowGetter={({ index }) => transactions[index]}
                  sort={handleSort}
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                >
                  <Column
                    dataKey="id"
                    width={40}
                    disableSort={true}
                    headerRenderer={() => (
                      <span
                        className="ReactVirtualized__Table__headerTruncatedText"
                        key="label"
                      >
                        <Checkbox
                          indeterminate={selected.length > 0 && selected.length < transactions.length}
                          checked={selected.length > 0 && selected.length === transactions.length}
                          onChange={event => this.handleSelectAllClick(event)}
                        />
                      </span>
                    )}
                    cellRenderer={({ cellData }) => {
                      const isSelected = this.isSelected(cellData)
                      return (
                        <span
                          className="ReactVirtualized__Table__headerTruncatedText"
                          key="label"
                        >
                          <Checkbox
                            checked={isSelected}
                            onChange={event => this.handleCheckboxClick(event, cellData)}
                          />
                        </span>
                      )
                    }}
                  />
                  <Column
                    width={120}
                    label="Date"
                    dataKey="createdAt"
                    cellDataGetter={({ rowData }) => formatDate(new Date(rowData.createdAt))}
                  />
                  <Column
                    width={200}
                    label="Description"
                    dataKey="description"
                    disableSort={true}
                    flexGrow={1}
                  />
                  <Column
                    width={130}
                    label="Category"
                    dataKey="category"
                  />
                  <Column
                    width={130}
                    label="In"
                    dataKey="amount"
                    cellDataGetter={({ rowData }) => ({ amount: rowData.amount, nativeAmount: rowData.nativeAmount })}
                    cellRenderer={({ cellData }) => (cellData.amount > 0 ? this.displayCurrency(cellData) : null)}
                  />
                  <Column
                    width={130}
                    label="Out"
                    dataKey="amount"
                    cellDataGetter={({ rowData }) => ({ amount: rowData.amount, nativeAmount: rowData.nativeAmount })}
                    cellRenderer={({ cellData }) => (cellData.amount < 0 ? this.displayCurrency(cellData) : null)}
                  />
                  <Column
                    width={40}
                    dataKey="index"
                    disableSort={true}
                    cellRenderer={
                      ({ rowData }) => (
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
                </Table>
              )}
            </AutoSizer>
          </div>
        </Paper>
=======
        </TransactionsTable>
>>>>>>> Added import transaction preview
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
  connect(makeMapStateToProps, mapDispatchToProps),
  withStyles(styles)
)(TransactionsComponent)
