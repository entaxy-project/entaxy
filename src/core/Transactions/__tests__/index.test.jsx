import React from 'react'
import renderer from 'react-test-renderer'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from '../../../store'
import { TransactionsComponent } from '../'

describe('Transactions', () => {
  const mochDeleteTransactions = jest.fn()
  const mochHandleSort = jest.fn()
  const props = {
    classes: { }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot with no transactions', () => {
    const component = renderer.create((
      <Provider store={store}>
        <BrowserRouter>
          <TransactionsComponent
            deleteTransactions={mochDeleteTransactions}
            handleSort={mochHandleSort}
            transactions={[]}
            sortBy="createAt"
            sortDirection="DESC"
            classes={{ ...props }}
          />
        </BrowserRouter>
      </Provider>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot with one transaction', () => {
    const component = renderer.create((
      <Provider store={store}>
        <BrowserRouter>
          <TransactionsComponent
            deleteTransactions={mochDeleteTransactions}
            handleSort={mochHandleSort}
            transactions={[{
              id: 3,
              institution: 'Questrade',
              account: 'RRSP',
              type: 'buy',
              ticker: 'VCE.TO',
              shares: '3',
              bookValue: '3',
              createdAt: new Date()
            }]}
            sortBy="createAt"
            sortDirection="DESC"
            classes={{ ...props }}
          />
        </BrowserRouter>
      </Provider>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
