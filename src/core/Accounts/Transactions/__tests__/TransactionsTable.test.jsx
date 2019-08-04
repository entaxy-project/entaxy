import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { BrowserRouter } from 'react-router-dom'
import { TransactionsTableComponent } from '../TransactionsTable'
import TransactionsToolbar from '../TransactionsToolbar'

describe('TransactionsTable', () => {
  const account = { id: 1, name: 'Checking', institution: 'TD' }
  const transactions = [
    { id: 1, description: 'Transaction 1', createdAt: Date.now() },
    { id: 2, description: 'Transaction 2', createdAt: Date.now() + 10 },
    { id: 3, description: 'Transaction 3', createdAt: Date.now() + 20 }
  ]
  const mochHandleNew = jest.fn()
  const mochHandleDelete = jest.fn()
  const mochFormatCurrency = jest.fn().mockReturnValue(() => {})
  const mochFormatDecimal = jest.fn().mockReturnValue(() => {})
  const mochFormatDate = jest.fn().mockReturnValue(() => {})
  let wrapper
  let instance

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot with no transactions', () => {
    const component = renderer.create((
      <BrowserRouter>
        <TransactionsTableComponent
          classes={{}}
          className=""
          account={account}
          transactions={[]}
          budget={{}}
          formatCurrency={mochFormatCurrency}
          formatDecimal={mochFormatDecimal}
          formatDate={mochFormatDate}
          Toolbar={TransactionsToolbar}
          toolbarProps={{
            handleNew: mochHandleNew,
            handleDelete: mochHandleDelete
          }}
        />
      </BrowserRouter>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot with some transactions', () => {
    const component = renderer.create((
      <BrowserRouter>
        <TransactionsTableComponent
          classes={{}}
          className=""
          account={account}
          transactions={transactions}
          budget={{}}
          formatCurrency={mochFormatCurrency}
          formatDecimal={mochFormatDecimal}
          formatDate={mochFormatDate}
          Toolbar={TransactionsToolbar}
          toolbarProps={{
            handleNew: mochHandleNew,
            handleDelete: mochHandleDelete
          }}
        />
      </BrowserRouter>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  describe('Component methods', () => {
    beforeEach(() => {
      wrapper = shallow((
        <TransactionsTableComponent
          classes={{}}
          className=""
          account={account}
          transactions={transactions}
          budget={{}}
          formatCurrency={mochFormatCurrency}
          formatDecimal={mochFormatDecimal}
          formatDate={mochFormatDate}
          Toolbar={TransactionsToolbar}
          toolbarProps={{
            handleNew: mochHandleNew,
            handleDelete: mochHandleDelete
          }}
        />
      ))
      instance = wrapper.instance()
    })

    describe('handleSort', () => {
      it('should sort ASC and DESC', () => {
        expect(instance.state.sortBy).toEqual('createdAt')
        expect(instance.state.sortDirection).toEqual('DESC')

        instance.handleSort({ sortBy: 'createdAt', sortDirection: 'ASC' })
        expect(instance.state.sortBy).toEqual('createdAt')
        expect(instance.state.sortDirection).toEqual('ASC')
      })
    })

    describe('filterAndSortTransactions', () => {
      it('should do basic orderBy', () => {
        instance.setState({
          sortBy: 'createdAt',
          sortDirection: 'ASC'
        })
        expect(instance.filterAndSortTransactions()).toEqual(transactions)
        instance.setState({
          sortBy: 'createdAt',
          sortDirection: 'DESC'
        })
        expect(instance.filterAndSortTransactions()).toEqual([...transactions].reverse())
      })

      it('should do basic filter', () => {
        instance.setState({
          filters: {
            createdAt: transactions[0].createdAt
          }
        })
        expect(instance.filterAndSortTransactions()).toEqual([transactions[0]])
        instance.setState({
          filters: {
            createdAt: transactions[1].createdAt,
            description: 'Bogus'
          }
        })
        expect(instance.filterAndSortTransactions()).toEqual([])
        instance.setState({
          filters: {
            createdAt: transactions[1].createdAt,
            description: transactions[1].description.toLowerCase()
          }
        })
        expect(instance.filterAndSortTransactions()).toEqual([transactions[1]])
      })

      it('should filter with a function', () => {
        instance.setState({
          sortBy: 'createdAt',
          sortDirection: 'ASC',
          filters: {
            createdAt: t => t.createdAt > transactions[0].createdAt
          }
        })
        expect(instance.filterAndSortTransactions()).toEqual([transactions[1], transactions[2]])
      })
    })

    describe('rowClassName', () => {
      const classes = {
        headerRow: 'headerRow',
        nativeAmount: 'nativeAmount',
        oddRow: 'oddRow',
        row: 'row',
        rowWithError: 'rowWithError',
        tableWrapper: 'tableWrapper'
      }

      it('should select row classes', () => {
        expect(instance.rowClassName({ index: -1 }, transactions, classes)).toEqual('headerRow oddRow')
        expect(instance.rowClassName({ index: 0 }, transactions, classes)).toEqual('row')
        expect(instance.rowClassName({ index: 1 }, transactions, classes)).toEqual('row oddRow')
        transactions[2].errors = ['Some error']
        expect(instance.rowClassName({ index: 2 }, transactions, classes)).toEqual('rowWithError row')
      })
    })

    describe('renderCellAmount', () => {
      it('should render for positive amounts', () => {
        expect(instance.renderCellAmount({ cellData: { amount: 1, restrictTo: 'positiveAmount' } })).not.toBeNull()
        expect(instance.renderCellAmount({ cellData: { amount: 0, restrictTo: 'positiveAmount' } })).toBeNull()
        expect(instance.renderCellAmount({ cellData: { amount: -1, restrictTo: 'positiveAmount' } })).toBeNull()
      })

      it('should render for negative amounts', () => {
        expect(instance.renderCellAmount({ cellData: { amount: -11, restrictTo: 'negativeAmount' } })).not.toBeNull()
        expect(instance.renderCellAmount({ cellData: { amount: 0, restrictTo: 'negativeAmount' } })).toBeNull()
        expect(instance.renderCellAmount({ cellData: { amount: 1, restrictTo: 'negativeAmount' } })).toBeNull()
      })
    })

    describe('setFilter, unsetFilter and resetFilters', () => {
      it('should set and unset filters on transactions', () => {
        expect(instance.state).toEqual({
          selected: [],
          filters: {},
          sortBy: 'createdAt',
          sortDirection: 'DESC',
          prevPropsAccountId: account.id
        })

        // Bogus filter
        instance.setFilter({ attr: 'filter1', value: 1 })
        expect(instance.state.filters).toEqual({ filter1: 1 })
        // Same filter again
        instance.setFilter({ attr: 'filter1', value: 1 })
        expect(instance.state.filters).toEqual({ filter1: 1 })
        // New filter
        instance.setFilter({ attr: 'id', value: 2 })
        expect(instance.state.filters).toEqual({ filter1: 1, id: 2 })
        // Remove the first filter
        instance.unsetFilter({ attr: 'filter1' })
        expect(instance.state.filters).toEqual({ id: 2 })
        // Reset all filter
        instance.resetFilters()
        expect(instance.state.filters).toEqual({ })
      })
    })

    describe('Transactions selection', () => {
      it('selects a single transaction', () => {
        expect(wrapper.state('selected')).toEqual([])
        // Select one
        instance.handleCheckboxClick(null, 1)
        expect(wrapper.state('selected')).toEqual([1])
        // Select another
        instance.handleCheckboxClick(null, 2)
        expect(wrapper.state('selected')).toEqual([1, 2])
        // Select one more
        instance.handleCheckboxClick(null, 4)
        expect(wrapper.state('selected')).toEqual([1, 2, 4])
        // Select one more
        instance.handleCheckboxClick(null, 3)
        expect(wrapper.state('selected')).toEqual([1, 2, 4, 3])

        // Un-select one from the middle
        instance.handleCheckboxClick(null, 4)
        expect(wrapper.state('selected')).toEqual([1, 2, 3])
        // Un-select last one
        instance.handleCheckboxClick(null, 3)
        expect(wrapper.state('selected')).toEqual([1, 2])
        // Un-select first one
        instance.handleCheckboxClick(null, 1)
        expect(wrapper.state('selected')).toEqual([2])
        // Empty
        instance.handleCheckboxClick(null, 2)
        expect(wrapper.state('selected')).toEqual([])
      })

      it('selects all transactions', () => {
        expect(wrapper.state('selected')).toEqual([])
        instance.handleSelectAllClick({ target: { checked: true } }, transactions)
        expect(wrapper.state('selected')).toEqual(transactions.map(n => n.id))
      })

      it('check selection', () => {
        expect(wrapper.state('selected')).toEqual([])
        instance.handleCheckboxClick(null, 1)
        expect(instance.isSelected(1)).toBe(true)
        expect(instance.isSelected(10)).toBe(false)
      })

      it('de-selects all transactions', () => {
        expect(wrapper.state('selected')).toEqual([])
        instance.handleCheckboxClick(null, 1)
        instance.handleCheckboxClick(null, 2)
        expect(wrapper.state('selected')).toEqual([1, 2])
        instance.handleSelectAllClick({ target: { checked: false } }, transactions)
        expect(wrapper.state('selected')).toEqual([])
      })
    })
  })
})
