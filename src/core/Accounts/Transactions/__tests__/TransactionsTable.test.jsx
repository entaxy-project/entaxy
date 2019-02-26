import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { BrowserRouter } from 'react-router-dom'
import { TransactionsTableComponent } from '../TransactionsTable'
import TransactionsToolbar from '../TransactionsToolbar'

describe('TransactionsTable', () => {
  const account = { id: 1, name: 'Checking', institution: 'TD' }
  const transactions = [
    { id: 1, createdAt: Date.now() },
    { id: 2, createdAt: Date.now() + 1 },
    { id: 3, createdAt: Date.now() + 2 }
  ]
  const mochHandleNew = jest.fn()
  const mochHandleDelete = jest.fn()
  const mochFormatCurrency = jest.fn().mockReturnValue(() => {})
  const mochFormatDecimal = jest.fn().mockReturnValue(() => {})
  const mochFormatDate = jest.fn().mockReturnValue(() => {})

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
    const wrapper = shallow((
      <TransactionsTableComponent
        classes={{}}
        className=""
        account={account}
        transactions={transactions}
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
    const instance = wrapper.instance()

    it('should set and unset filters on transactions', () => {
      expect(instance.state).toEqual({
        selected: [],
        filters: {},
        sortBy: 'createdAt',
        sortDirection: 'DESC',
        filteredTransactions: transactions,
        prevPropsAccountId: account.id
      })

      // Bogus filter
      instance.setFilter({ attr: 'filter1', value: 1 })
      expect(instance.state.filters).toEqual({ filter1: 1 })
      expect(instance.state.filteredTransactions).toEqual([])
      // Same filter again
      instance.setFilter({ attr: 'filter1', value: 1 })
      expect(instance.state.filters).toEqual({ filter1: 1 })
      expect(instance.state.filteredTransactions).toEqual([])
      // New filter
      instance.setFilter({ attr: 'id', value: 2 })
      expect(instance.state.filters).toEqual({ filter1: 1, id: 2 })
      expect(instance.state.filteredTransactions).toEqual([])
      // Remove the first filter
      instance.unsetFilter({ attr: 'filter1' })
      expect(instance.state.filters).toEqual({ id: 2 })
      expect(instance.state.filteredTransactions).toEqual([transactions[1]])
      // Reset all filter
      instance.resetFilters()
      expect(instance.state.filters).toEqual({ })
      expect(instance.state.filteredTransactions).toEqual(transactions)
    })

    describe('Transactions selection', () => {
      it('selects all transactions', () => {
        expect(wrapper.state('selected')).toEqual([])
        instance.handleSelectAllClick({ target: { checked: true } })
        expect(wrapper.state('selected')).toEqual(transactions.map(n => n.id))
      })

      it('check selection', () => {
        expect(wrapper.state('selected')).toEqual(transactions.map(n => n.id))
        expect(instance.isSelected(1)).toBe(true)
        expect(instance.isSelected(10)).toBe(false)
      })

      it('de-selects all transactions', () => {
        expect(wrapper.state('selected')).toEqual(transactions.map(n => n.id))
        instance.handleSelectAllClick({ target: { checked: false } })
        expect(wrapper.state('selected')).toEqual([])
      })

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
    })
  })
})
