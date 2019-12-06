/* eslint-disable react/forbid-prop-types */
import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Checkbox from '@material-ui/core/Checkbox'
import grey from '@material-ui/core/colors/grey'
import Chip from '@material-ui/core/Chip'
import { orderBy } from 'lodash'
import { Column, Table, AutoSizer } from 'react-virtualized'
import chroma from 'chroma-js'
import {
  currencyFormatter,
  decimalFormatter,
  dateFormatter
} from '../../../util/stringFormatter'
import { filterByErrors, filterByDuplicates } from '../../../store/transactions/actions'

const styles = (theme) => ({
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
  openingBalance: {
    fontFamily: theme.typography.subtitle2.fontFamily,
    fontWeight: theme.typography.subtitle2.fontWeight,
    fontSize: theme.typography.subtitle2.fontSize,
    color: theme.palette.text.disabled
  },
  row: {
    borderBottom: '1px solid #e0e0e0',
    fontFamily: theme.typography.subtitle2.fontFamily,
    fontWeight: theme.typography.body2.fontWeight,
    fontSize: theme.typography.subtitle2.fontSize,
    '&:hover': {
      background: grey[200]
    }
  },
  selectedRow: {
    backgroundColor: theme.palette.info.background
  },
  rowWithError: {
    backgroundColor: theme.palette.danger.background,
    color: theme.palette.danger.text
  },
  rowWithDuplicate: {
    backgroundColor: theme.palette.warning.background,
    color: theme.palette.warning.text
  },
  nativeAmount: {
    color: grey[500],
    display: 'block'
  },
  category: {
    background: 'red'
  }
})

const mapStateToProps = (state, props) => ({
  budget: state.budget,
  formatCurrency: currencyFormatter(state.settings.locale, props.account.currency),
  formatDecimal: decimalFormatter(state.settings.locale, props.account.accountType),
  formatDate: dateFormatter(state.settings.locale)
})

export class TransactionsTableComponent extends React.Component {
  state = {
    selected: [],
    filters: {},
    sortBy: 'createdAt',
    sortDirection: 'DESC'
  }

  static getDerivedStateFromProps(props, state) {
    // Reset the selected transactions when choosing a different account
    if (props.account.id !== state.prevPropsAccountId) {
      return {
        prevPropsAccountId: props.account.id,
        selected: [],
        filters: {},
        sortBy: 'createdAt',
        sortDirection: 'DESC'
      }
    }
    return null
  }

  setFilter = ({ attr, value }) => {
    this.setState((prevState) => ({
      filters: {
        ...prevState.filters,
        [attr]: value
      }
    }))
  }

  unsetFilter = ({ attr }) => {
    const { [attr]: _, ...filters } = this.state.filters
    this.setState({ filters })
  }

  resetFilters = () => {
    this.setState({ filters: {} })
  }

  handleSort = ({ sortBy, sortDirection }) => {
    this.setState({ sortBy, sortDirection })
  }

  filterAndSortTransactions = () => {
    const { sortBy, sortDirection, filters } = this.state
    const filteredTransactions = this.props.transactions
      .filter((transaction) => (
        Object.keys(filters).reduce((result, attr) => {
          if (attr === 'description') {
            return result && this.filterByDescriptionAndCategory(transaction)
          }
          if (attr === 'errors') {
            return result && filterByErrors(transaction)
          }
          if (attr === 'duplicates') {
            return result && filterByDuplicates(transaction)
          }
          if (typeof filters[attr] === 'function') {
            return result && filters[attr](transaction)
          }
          return result && transaction[attr] === filters[attr]
        }, true)
      ))
    return orderBy(filteredTransactions, [sortBy], [sortDirection.toLowerCase()])
  }

  filterByDescriptionAndCategory = (transaction) => {
    const searchKey = this.state.filters.description.toLowerCase()
    let res = transaction.description.toLowerCase().includes(searchKey)
    if (transaction.categoryId !== undefined) {
      const category = this.props.budget.categoriesById[transaction.categoryId].name
      res = res || category.toLowerCase().includes(this.state.filters.description.toLowerCase())
    }
    if (transaction.amount.accountCurrency) {
      res = res || transaction.amount.accountCurrency.toString().includes(searchKey)
    }
    return res
  }

  resetSelection = () => this.setState({ selected: [] })

  isSelected = (id) => this.state.selected.indexOf(id) !== -1

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

  handleSelectAllClick = (event, filteredTransactions) => {
    if (event.target.checked) {
      this.setState({
        selected: filteredTransactions.reduce((result, transaction) => {
          return [...result, ...('id' in transaction ? [transaction.id] : [])]
        }, [])
      })
      return
    }
    this.resetSelection()
  }

  transactionHasErrors = (transaction) => (
    transaction.errors !== undefined && transaction.errors.length > 0
  )

  rowClassName = ({ index }, filteredTransactions, classes) => {
    const transaction = filteredTransactions[index]
    const isHeader = index < 0
    const isOpeningBalance = transaction && transaction.type === 'openingBalance'
    const hasErrors = transaction && this.transactionHasErrors(transaction)
    const isDuplicate = transaction && transaction.duplicate !== undefined
    const isSelected = transaction && this.state.selected.includes(transaction.id)
    return classNames({
      [classes.headerRow]: isHeader,
      [classes.openingBalance]: !isHeader && isOpeningBalance,
      [classes.rowWithError]: !isHeader && hasErrors,
      [classes.rowWithDuplicate]: !isHeader && isDuplicate,
      [classes.row]: !isHeader,
      [classes.selectedRow]: !isHeader && isSelected
    })
  }

  renderCellAmount = ({ cellData }) => {
    return {
      positiveAmount: cellData.amount >= 0
        ? this.props.formatDecimal(cellData.amount)
        : null,
      negativeAmount: cellData.amount < 0
        ? this.props.formatDecimal(cellData.amount)
        : null
    }[cellData.restrictTo]
  }

  render() {
    const {
      classes,
      className,
      children,
      account,
      budget,
      formatDate,
      Toolbar,
      toolbarProps,
      hideChekboxes
    } = this.props
    const {
      selected,
      sortBy,
      sortDirection
    } = this.state

    const filteredTransactions = this.filterAndSortTransactions()
    const filteredTransactionsIncludeOpeningBalance = !!filteredTransactions
      .find((transaction) => transaction.type === 'openingBalance')

    const rowHeight = account.type === 'wallet' ? 42 : 30
    return (
      <div className={`${[classes.tableWrapper, className].join(' ')}`}>
        <Toolbar
          {...toolbarProps}
          account={account}
          selectedTransactions={selected}
          resetSelection={this.resetSelection}
          filterProps={{
            filters: this.state.filters,
            setFilter: this.setFilter,
            unsetFilter: this.unsetFilter
          }}
        />
        <AutoSizer>
          {({ width, height }) => (
            <Table
              width={width || 100}
              height={height || 100}
              headerHeight={25}
              rowHeight={rowHeight}
              rowClassName={(index) => this.rowClassName(index, filteredTransactions, classes)}
              rowCount={filteredTransactions.length}
              rowGetter={({ index }) => filteredTransactions[index]}
              sort={this.handleSort}
              sortBy={sortBy}
              sortDirection={sortDirection}
              tabIndex={null}
            >
              {!hideChekboxes && (
                <Column
                  dataKey="id"
                  width={40}
                  disableSort={true}
                  headerRenderer={() => {
                    let filteredTransactionsLength = filteredTransactions.length
                    if (filteredTransactionsIncludeOpeningBalance) filteredTransactionsLength -= 1
                    return (
                      <span
                        className="ReactVirtualized__Table__headerTruncatedText"
                        key="label"
                      >
                        <Checkbox
                          indeterminate={selected.length > 0 && selected.length < filteredTransactionsLength}
                          checked={selected.length > 0 && selected.length === filteredTransactionsLength}
                          onChange={(event) => this.handleSelectAllClick(event, filteredTransactions)}
                        />
                      </span>
                    )
                  }}
                  cellRenderer={({ cellData }) => cellData !== undefined && (
                    <span
                      className="ReactVirtualized__Table__headerTruncatedText"
                      key="label"
                    >
                      <Checkbox
                        checked={this.isSelected(cellData)}
                        onChange={(event) => this.handleCheckboxClick(event, cellData)}
                      />
                    </span>
                  )}
                />
              )}
              <Column
                width={120}
                label="Date"
                dataKey="createdAt"
                cellDataGetter={({ rowData }) => (
                  rowData.createdAt ? formatDate(new Date(rowData.createdAt)) : null
                )}
              />
              <Column
                width={200}
                label="Description"
                dataKey="description"
                flexGrow={1}
              />
              <Column
                width={200}
                label="Category"
                dataKey="categoryId"
                cellRenderer={
                  ({ rowData }) => {
                    if (rowData.categoryId === undefined) return null
                    const category = budget.categoriesById[rowData.categoryId]
                    if (category === undefined) return null
                    if (category.colour === undefined) return null
                    return (
                      <Chip
                        size="small"
                        label={category.name}
                        style={{
                          background: category.colour,
                          color: chroma.contrast(category.colour, 'black') > 5 ? 'black' : 'white'
                        }}
                      />
                    )
                  }
                }
              />
              <Column
                width={130}
                label="In"
                dataKey="amount"
                headerStyle={{ textAlign: 'right' }}
                style={{ textAlign: 'right' }}
                cellDataGetter={({ rowData }) => ({
                  amount: rowData.amount.accountCurrency,
                  nativeAmount: rowData.nativeAmount,
                  restrictTo: 'positiveAmount'
                })}
                cellRenderer={this.renderCellAmount}
              />
              <Column
                width={130}
                label="Out"
                dataKey="amount"
                headerStyle={{ textAlign: 'right' }}
                style={{ textAlign: 'right' }}
                cellDataGetter={({ rowData }) => ({
                  amount: rowData.amount.accountCurrency,
                  nativeAmount: rowData.nativeAmount,
                  restrictTo: 'negativeAmount'
                })}
                cellRenderer={this.renderCellAmount}
              />
              { children }
            </Table>
          )}
        </AutoSizer>
      </div>
    )
  }
}

TransactionsTableComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  children: PropTypes.node,
  Toolbar: PropTypes.any.isRequired,
  toolbarProps: PropTypes.object,
  account: PropTypes.object.isRequired,
  transactions: PropTypes.array.isRequired,
  budget: PropTypes.object.isRequired,
  formatCurrency: PropTypes.func.isRequired,
  formatDecimal: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  hideChekboxes: PropTypes.bool
}

TransactionsTableComponent.defaultProps = {
  className: undefined,
  children: undefined,
  toolbarProps: undefined,
  hideChekboxes: false
}

export default compose(
  connect(mapStateToProps),
  withStyles(styles)
)(TransactionsTableComponent)
