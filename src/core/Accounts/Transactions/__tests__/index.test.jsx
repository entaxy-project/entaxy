import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import store from '../../../../store'
import ThemeProvider from '../../../ThemeProvider'
import { TransactionsComponent } from '..'

jest.mock('../TransactionDialog', () => 'TransactionDialog')

describe('Transactions', () => {
  const account = {
    id: 1,
    name: 'Checking',
    institution: 'TD',
    currency: 'CAD',
    openingBalance: 0,
    openingBalanceDate: Date.parse('2019/01/01')
  }
  const transactions = [{
    id: 1,
    accountId: 1,
    amount: 10,
    createdAt: Date.now()
  }, {
    id: 2,
    accountId: 1,
    amount: -5,
    createdAt: Date.now() + 10
  }]
  const mochDeleteTransactions = jest.fn()
  const mochHandleSort = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot with no transactions', () => {
    const component = renderer.create((
      <Provider store={store}>
        <ThemeProvider>
          <BrowserRouter>
            <TransactionsComponent
              classes={{ }}
              account={account}
              deleteTransactions={mochDeleteTransactions}
              handleSort={mochHandleSort}
              transactions={[]}
            />
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot with one transaction in a fiat account', () => {
    expect(account.type).toBeUndefined()
    const component = renderer.create((
      <Provider store={store}>
        <ThemeProvider>
          <BrowserRouter>
            <TransactionsComponent
              classes={{ }}
              account={account}
              deleteTransactions={mochDeleteTransactions}
              handleSort={mochHandleSort}
              transactions={transactions}
            />
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  describe('Component methods', () => {
    describe('TransactionsDialog', () => {
      const wrapper = shallow((
        <TransactionsComponent
          classes={{ }}
          account={account}
          deleteTransactions={mochDeleteTransactions}
          handleSort={mochHandleSort}
          transactions={transactions}
        />
      ))
      const instance = wrapper.instance()

      it('opens new transaction dialog', () => {
        expect(wrapper.state('openTransactionDialog')).toBe(false)
        expect(wrapper.state('transaction')).toBe(null)
        instance.handleNew()
        expect(wrapper.state('openTransactionDialog')).toBe(true)
        expect(wrapper.state('transaction')).toBe(null)
      })

      it('closes transaction dialog', () => {
        expect(wrapper.state('openTransactionDialog')).toBe(true)
        expect(wrapper.state('transaction')).toBe(null)
        instance.handleCancel()
        expect(wrapper.state('openTransactionDialog')).toBe(false)
        expect(wrapper.state('transaction')).toEqual(null)
      })

      it('opens edit transaction dialog', () => {
        const transaction = { id: 1 }
        expect(wrapper.state('openTransactionDialog')).toBe(false)
        expect(wrapper.state('transaction')).toBe(null)
        instance.handleEdit(transaction)
        expect(wrapper.state('openTransactionDialog')).toBe(true)
        expect(wrapper.state('transaction')).toEqual(transaction)
      })
    })
  })
})
