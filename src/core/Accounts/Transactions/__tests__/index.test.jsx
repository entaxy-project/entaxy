import React from 'react'
import renderer from 'react-test-renderer'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from '../../../../store'
import { TransactionsComponent } from '../'

describe('Transactions', () => {
  const mochDeleteTransactions = jest.fn()
  const mochHandleSort = jest.fn()

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
            classes={{ }}
            account={{ id: 1, nstitution: 'TD' }}
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
          />
        </BrowserRouter>
      </Provider>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
