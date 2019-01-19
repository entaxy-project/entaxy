import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { TransactionsComponent } from '../'

jest.mock('../TransactionDialog', () => 'TransactionDialog')
jest.mock('../TransactionsToolbar', () => 'TransactionsToolbar')

describe('Transactions', () => {
  const mochDeleteTransactions = jest.fn()
  const mochHandleSort = jest.fn()
  const mochFormatCurrency = jest.fn().mockReturnValue(() => {})
  const mochFormatDecimal = jest.fn().mockReturnValue(() => {})
  const mochFormatDate = jest.fn().mockReturnValue(() => {})

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot with no transactions', () => {
    const component = renderer.create((
      <TransactionsComponent
        deleteTransactions={mochDeleteTransactions}
        handleSort={mochHandleSort}
        transactions={[]}
        sortBy="createAt"
        sortDirection="DESC"
        classes={{ }}
        account={{ id: 1, nstitution: 'TD' }}
        formatCurrency={mochFormatCurrency}
        formatDecimal={mochFormatDecimal}
        formatDate={mochFormatDate}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot with one transaction', () => {
    const component = renderer.create((
      <TransactionsComponent
        deleteTransactions={mochDeleteTransactions}
        handleSort={mochHandleSort}
        account={{ id: 1, description: 'TD EasyWeb', institution: 'TD' }}
        transactions={[{
          id: 3,
          accountId: 1,
          amount: 3,
          createdAt: Date.now()
        }]}
        sortBy="createAt"
        sortDirection="DESC"
        classes={{ }}
        formatCurrency={mochFormatCurrency()}
        formatDecimal={mochFormatDecimal()}
        formatDate={mochFormatDate}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  describe('Component methods', () => {
    describe('TransactionsDialog', () => {
      const wrapper = shallow((
        <TransactionsComponent
          deleteTransactions={mochDeleteTransactions}
          handleSort={mochHandleSort}
          transactions={[]}
          sortBy="createAt"
          sortDirection="DESC"
          classes={{ }}
          account={{ id: 1, nstitution: 'TD' }}
          formatCurrency={mochFormatCurrency}
          formatDecimal={mochFormatDecimal}
          formatDate={mochFormatDate}
        />
      ))
      const instance = wrapper.instance()

      it('opens new transaction dialog', () => {
        expect(wrapper.state('openTransactionDialog')).toBe(false)
        expect(wrapper.state('transaction')).toBe(null)
        expect(wrapper.state('selected')).toEqual([])
        instance.handleNew()
        expect(wrapper.state('openTransactionDialog')).toBe(true)
        expect(wrapper.state('transaction')).toBe(null)
        expect(wrapper.state('selected')).toEqual([])
      })

      it('closes transaction dialog', () => {
        expect(wrapper.state('openTransactionDialog')).toBe(true)
        expect(wrapper.state('transaction')).toBe(null)
        expect(wrapper.state('selected')).toEqual([])
        instance.handleCancel()
        expect(wrapper.state('openTransactionDialog')).toBe(false)
        expect(wrapper.state('transaction')).toEqual(null)
        expect(wrapper.state('selected')).toEqual([])
      })

      it('opens edit transaction dialog', () => {
        const transaction = { id: 1 }
        expect(wrapper.state('openTransactionDialog')).toBe(false)
        expect(wrapper.state('transaction')).toBe(null)
        expect(wrapper.state('selected')).toEqual([])
        instance.handleEdit(transaction)
        expect(wrapper.state('openTransactionDialog')).toBe(true)
        expect(wrapper.state('transaction')).toEqual(transaction)
        expect(wrapper.state('selected')).toEqual([])
      })
    })

    describe('Transactions selection', () => {
      const transactions = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]
      const wrapper = shallow((
        <TransactionsComponent
          deleteTransactions={mochDeleteTransactions}
          handleSort={mochHandleSort}
          transactions={transactions}
          sortBy="createAt"
          sortDirection="DESC"
          classes={{ }}
          account={{ id: 1, nstitution: 'TD' }}
          formatCurrency={mochFormatCurrency}
          formatDecimal={mochFormatDecimal}
          formatDate={mochFormatDate}
        />
      ))
      const instance = wrapper.instance()

      it('selects all transactions', () => {
        expect(wrapper.state('selected')).toEqual([])
        instance.handleSelectAllClick({ target: { checked: true } })
        expect(wrapper.state('selected')).toEqual(transactions.map(n => n.id))
      })

      it('check selection', async () => {
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
        instance.handleCheckboxClick(null, 3)
        expect(wrapper.state('selected')).toEqual([1, 2, 4])
        // Un-select last one
        instance.handleCheckboxClick(null, 4)
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
