import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import IconButton from '@material-ui/core/IconButton'
import EditIcon from '@material-ui/icons/Edit'
import Paper from '@material-ui/core/Paper'
import Checkbox from '@material-ui/core/Checkbox'
import Tooltip from '@material-ui/core/Tooltip'
import { Column, Table, AutoSizer } from 'react-virtualized'
import 'react-virtualized/styles.css'
import TransactionDialog from './TransactionDialog'
import TransactionsToolbar from './TransactionsToolbar'
import confirm from '../../../util/confirm'
import { deleteTransactions, updateSortBy } from '../../../store/transactions/actions'
import { makeAccountTransactions } from '../../../store/transactions/selectors'
import { currencyFormatter, dateFormatter } from '../../../util/stringFormatter'

const styles = theme => ({
  paper: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: 'calc(100vh - 70px)'
  },
  tableWrapper: {
    flex: '1 1 auto'
  },
  headerRow: {
    borderBottom: '1px solid #e0e0e0',
    fontFamily: theme.typography.subtitle2.fontFamily,
    fontWeight: theme.typography.subtitle2.fontWeight,
    fontSize: theme.typography.subtitle2.fontSize,
    color: theme.palette.text.disabled
  },
  row: {
    borderBottom: '1px solid #e0e0e0',
    fontFamily: theme.typography.subtitle2.fontFamily,
    fontWeight: theme.typography.body2.fontWeight,
    fontSize: theme.typography.subtitle2.fontSize
  },
  oddRow: {
    backgroundColor: '#fafafa'
  },
  tableButton: {
    padding: 4
  },
  smallIcon: {
    fontSize: 18
  }
})

// https://medium.com/@parkerdan/react-reselect-and-redux-b34017f8194c
const makeMapStateToProps = () => {
  const accountTransactions = makeAccountTransactions()
  const mapStateToProps = (state, props) => {
    const account = state.accounts.byId[props.match.params.accountId]
    return {
      formatCurrency: currencyFormatter(state.settings.locale, account.currency),
      formatDate: dateFormatter(state.settings.locale),
      sortBy: state.transactions.sortBy,
      sortDirection: state.transactions.sortDirection,
      account,
      transactions: accountTransactions(state, props).transactions
    }
  }
  return mapStateToProps
}

const mapDispatchToProps = (dispatch) => {
  return {
    deleteTransactions: (account, transactionIds) => dispatch(deleteTransactions(account, transactionIds)),
    handleSort: ({ sortBy, sortDirection }) => dispatch(updateSortBy(sortBy, sortDirection))
  }
}

export class TransactionsComponent extends React.Component {
  static getDerivedStateFromProps(props, state) {
    // Reset the selected transactions when choosing a different account
    if (props.account.id !== state.prevPropsAccountId) {
      return {
        prevPropsAccountId: props.account.id,
        openTransactionDialog: false,
        transaction: null,
        selected: []
      }
    }
    return null
  }

  state = {
    openTransactionDialog: false,
    transaction: null,
    selected: []
  }

  handleNew = () => {
    this.setState({
      openTransactionDialog: true,
      transaction: null,
      selected: []
    })
  }

  handleEdit = (transaction) => {
    this.setState({
      openTransactionDialog: true,
      transaction,
      selected: []
    })
  }

  handleCancel = () => {
    this.setState({ openTransactionDialog: false })
  }

  rowClassName = ({ index }, classes) => (
    classNames({
      [classes.headerRow]: index < 0,
      [classes.row]: index >= 0,
      [classes.oddRow]: index % 2 !== 0
    })
  )

  handleSelectAllClick = (event) => {
    if (event.target.checked) {
      this.setState({ selected: this.props.transactions.map(n => n.id) })
      return
    }
    this.setState({ selected: [] })
  }

  handleCheckboxClick = (event, transactionId) => {
    const { selected } = this.state
    const selectedIndex = selected.indexOf(transactionId)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, transactionId)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      )
    }

    this.setState({ selected: newSelected })
  }

  handleDelete = () => {
    confirm('Delete selected transactions?', 'Are you sure?').then(() => {
      this.props.deleteTransactions(this.props.account, this.state.selected)
      this.setState({ selected: [] })
    })
  }

  isSelected = id => this.state.selected.indexOf(id) !== -1

  render() {
    const {
      formatCurrency,
      formatDate,
      classes,
      transactions,
      sortBy,
      sortDirection,
      handleSort,
      account
    } = this.props
    const { selected } = this.state

    return (
      <div>
        <TransactionDialog
          open={this.state.openTransactionDialog}
          onCancel={this.handleCancel}
          account={account}
          transaction={this.state.transaction}
        />
        <Paper elevation={0} className={classes.paper}>
          <TransactionsToolbar
            account={account}
            handleNew={this.handleNew}
            handleDelete={this.handleDelete}
            selectedTransactions={selected}
          />
          <div className={classes.tableWrapper}>
            <AutoSizer>
              {({ width, height }) => (
                <Table
                  width={width}
                  height={height}
                  headerHeight={25}
                  rowHeight={30}
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
                    width={100}
                    label="In"
                    dataKey="amount"
                    cellDataGetter={({ rowData }) => {
                      if (rowData.amount > 0) { return formatCurrency(rowData.amount) }
                      return null
                    }}
                  />
                  <Column
                    width={100}
                    label="Out"
                    dataKey="amount"
                    cellDataGetter={({ rowData }) => {
                      if (rowData.amount < 0) { return formatCurrency(rowData.amount) }
                      return null
                    }}
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
      </div>
    )
  }
}

TransactionsComponent.propTypes = {
  formatCurrency: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  transactions: PropTypes.array.isRequired,
  handleSort: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  sortDirection: PropTypes.string.isRequired,
  deleteTransactions: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired
}

export default compose(
  connect(makeMapStateToProps, mapDispatchToProps),
  withStyles(styles)
)(TransactionsComponent)
