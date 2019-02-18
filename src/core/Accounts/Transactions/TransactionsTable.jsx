import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Checkbox from '@material-ui/core/Checkbox'
import grey from '@material-ui/core/colors/grey'
import { Column, Table, AutoSizer } from 'react-virtualized'
import {
  currencyFormatter,
  decimalFormatter,
  dateFormatter
} from '../../../util/stringFormatter'

const styles = theme => ({
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
  rowWithError: {
    backgroundColor: theme.palette.danger.background,
    color: theme.palette.danger.text
  },
  nativeAmount: {
    color: grey[500],
    display: 'block'
  }
})

const mapStateToProps = (state, props) => {
  return {
    formatCurrency: currencyFormatter(state.settings.locale, props.account.currency),
    formatDecimal: decimalFormatter(state.settings.locale, props.account.type),
    formatDate: dateFormatter(state.settings.locale)
  }
}

export class TransactionTableComponent extends React.Component {
  state = {
    selected: [],
    filters: {},
    sortBy: 'createdAt',
    sortDirection: 'DESC',
    filteredTransactions: []
  }

  static getDerivedStateFromProps(props, state) {
    // Reset the selected transactions when choosing a different account
    if (props.account.id !== state.prevPropsAccountId) {
      return {
        prevPropsAccountId: props.account.id,
        selected: [],
        sortBy: 'createdAt',
        sortDirection: 'DESC',
        filteredTransactions: props.transactions.sort((a, b) => a.createdAt < b.createdAt)
      }
    }
    return null
  }

  setFilter = ({ attr, value }) => {
    const filters = {
      ...this.state.filters,
      [attr]: value
    }
    this.setState({
      filters,
      filteredTransactions: this.filterTransactions({ filters })
    })
  }

  unsetFilter = ({ attr }) => {
    const { [attr]: _, ...filters } = this.state.filters
    this.setState({
      filters,
      filteredTransactions: this.filterTransactions({ filters })
    })
  }

  resetFilters = () => {
    const filters = {}
    this.setState({
      filters,
      filteredTransactions: this.filterTransactions({ filters })
    })
  }

  handleSort = ({ sortBy, sortDirection }) => {
    this.setState({
      sortBy,
      sortDirection,
      filteredTransactions: this.filterTransactions({ sortBy, sortDirection })
    })
  }

  filterTransactions = ({
    sortBy = this.state.sortBy,
    sortDirection = this.state.sortDirection,
    filters = this.state.filters
  }) => (
    this.props.transactions
      .filter(transaction => (
        Object.keys(filters).reduce((result, attr) => {
          let evaluation
          if (typeof filters[attr] === 'function') {
            evaluation = filters[attr](transaction)
          } else {
            evaluation = transaction[attr] === filters[attr]
          }
          return result && evaluation
        }, true)
      ))
      .sort((a, b) => (
        sortDirection === 'ASC' ? a[sortBy] > b[sortBy] : a[sortBy] < b[sortBy]
      ))
  )

  resetSelection = () => this.setState({ selected: [] })

  isSelected = id => this.state.selected.indexOf(id) !== -1

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

  handleSelectAllClick = (event) => {
    if (event.target.checked) {
      this.setState({ selected: this.state.filteredTransactions.map(n => n.id) })
      return
    }
    this.resetSelection()
  }

  rowClassName = ({ index }, classes) => {
    return classNames({
      [classes.headerRow]: index < 0,
      [classes.rowWithError]: (index >= 0 && this.state.filteredTransactions[index].error !== undefined),
      [classes.row]: index >= 0,
      [classes.oddRow]: index % 2 !== 0
    })
  }

  displayCurrency = ({ amount, nativeAmount }) => {
    const {
      classes,
      account,
      formatCurrency,
      formatDecimal
    } = this.props
    if (account.type === 'wallet') {
      return (
        <div>
          {formatDecimal(amount)} {account.symbol}
          <small className={classes.nativeAmount}>{formatCurrency(nativeAmount)}</small>
        </div>
      )
    }
    return formatCurrency(amount)
  }

  render() {
    const {
      classes,
      className,
      children,
      account,
      formatDate,
      Toolbar,
      toolbarProps,
      hideChekboxes
    } = this.props
    const {
      selected,
      sortBy,
      sortDirection,
      filteredTransactions
    } = this.state
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
              width={width}
              height={height}
              headerHeight={25}
              rowHeight={rowHeight}
              rowClassName={index => this.rowClassName(index, classes)}
              rowCount={filteredTransactions.length}
              rowGetter={({ index }) => filteredTransactions[index]}
              sort={this.handleSort}
              sortBy={sortBy}
              sortDirection={sortDirection}
            >
              {!hideChekboxes &&
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
                        indeterminate={selected.length > 0 && selected.length < filteredTransactions.length}
                        checked={selected.length > 0 && selected.length === filteredTransactions.length}
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
              }
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
              { children }
            </Table>
          )}
        </AutoSizer>
      </div>
    )
  }
}

TransactionTableComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  children: PropTypes.node,
  Toolbar: PropTypes.func.isRequired,
  toolbarProps: PropTypes.object,
  account: PropTypes.object.isRequired,
  transactions: PropTypes.array.isRequired,
  formatCurrency: PropTypes.func.isRequired,
  formatDecimal: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  hideChekboxes: PropTypes.bool
}

TransactionTableComponent.defaultProps = {
  className: undefined,
  children: undefined,
  toolbarProps: undefined,
  hideChekboxes: false
}

export default compose(
  connect(mapStateToProps),
  withStyles(styles)
)(TransactionTableComponent)
