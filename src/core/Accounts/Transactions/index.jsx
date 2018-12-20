import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import IconButton from '@material-ui/core/IconButton'
import EditIcon from '@material-ui/icons/Edit'
import format from 'date-fns/format'
import Paper from '@material-ui/core/Paper'
import Checkbox from '@material-ui/core/Checkbox'
import Tooltip from '@material-ui/core/Tooltip'
import AddIcon from '@material-ui/icons/Add'
import { Column, Table, AutoSizer } from 'react-virtualized'
import 'react-virtualized/styles.css'
import TransactionDialog from './TransactionDialog'
import TableToolbar from '../../../common/TableToolbar'
import confirm from '../../../util/confirm'
import { deleteTransactions, updateSortBy } from '../../../store/transactions/actions'
import { sortedTransactions } from '../../../store/transactions/selectors'

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

const mapStateToProps = (state) => {
  return {
    transactions: sortedTransactions(state),
    sortBy: state.transactions.sortBy,
    sortDirection: state.transactions.sortDirection
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    deleteTransactions: transactionIds => dispatch(deleteTransactions(transactionIds)),
    handleSort: ({ sortBy, sortDirection }) => dispatch(updateSortBy(sortBy, sortDirection))
  }
}

export class TransactionsComponent extends React.Component {
  state = {
    openTransactionDialog: false,
    transaction: null,
    selected: []
  }

  handleNew = () => {
    this.setState({ openTransactionDialog: true, transaction: null })
  }

  handleEdit = (transaction) => {
    this.setState({ openTransactionDialog: true, transaction })
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
      this.props.deleteTransactions(this.state.selected)
      this.setState({ selected: [] })
    })
  }

  isSelected = id => this.state.selected.indexOf(id) !== -1

  render() {
    const currencyFormatter = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' })
    const {
      classes,
      transactions,
      sortBy,
      sortDirection,
      handleSort
    } = this.props

    const { selected } = this.state
    return (
      <div>
        <TransactionDialog
          open={this.state.openTransactionDialog}
          onCancel={this.handleCancel}
          transaction={this.state.transaction}
        />
        <Paper elevation={0} className={classes.paper}>
          <TableToolbar
            title="Transactions"
            selectedItems={selected}
            onDelete={this.handleDelete}
          >
            <Tooltip title="New transaction">
              <IconButton aria-label="New transaction" onClick={this.handleNew}>
                <AddIcon />
              </IconButton>
            </Tooltip>
          </TableToolbar>
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
                    label="Institution"
                    dataKey="institution"
                    width={120}
                  />
                  <Column
                    label="Account"
                    dataKey="account"
                    width={100}
                  />
                  <Column
                    width={120}
                    label="Date"
                    dataKey="createdAt"
                    cellDataGetter={({ rowData }) => format(rowData.createdAt, 'dd/MM/yyyy')}
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
                    dataKey="shares"
                    cellDataGetter={({ rowData }) => {
                      if (rowData.shares > 0) { return currencyFormatter.format(rowData.shares) }
                      return null
                    }}
                  />
                  <Column
                    width={100}
                    label="Out"
                    dataKey="shares"
                    cellDataGetter={({ rowData }) => {
                      if (rowData.shares < 0) { return currencyFormatter.format(rowData.shares) }
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
  classes: PropTypes.object.isRequired,
  transactions: PropTypes.array.isRequired,
  handleSort: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  sortDirection: PropTypes.string.isRequired,
  deleteTransactions: PropTypes.func.isRequired
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles)
)(TransactionsComponent)
