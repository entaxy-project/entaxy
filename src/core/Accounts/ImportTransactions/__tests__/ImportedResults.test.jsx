import React from 'react'
import renderer from 'react-test-renderer'
import { Provider } from 'react-redux'
import store from '../../../../store'
import ThemeProvider from '../../../ThemeProvider'
import ImportedResults from '../ImportedResults'


describe('ImportedResults', () => {
  const mockOnSave = jest.fn()
  const mockOnBack = jest.fn()
  const account = {
    id: 1,
    name: 'Checking',
    institution: 'TD',
    currency: 'CAD'
  }
  const transactions = [{
    id: 1,
    accountId: 1,
    amount: 10,
    createAt: Date.now()
  }, {
    id: 2,
    accountId: 1,
    amount: -5,
    createAt: Date.now() + 10
  }]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot without errors', () => {
    const component = renderer.create((
      <Provider store={store}>
        <ThemeProvider>
          <ImportedResults
            account={account}
            transactions={transactions}
            errors={{ base: [], transactions: [] }}
            onSave={mockOnSave}
            onBack={mockOnBack}
          />
        </ThemeProvider>
      </Provider>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot with errors', () => {
    transactions.push({
      id: 3,
      accountId: 1,
      amount: 11,
      createAt: Date.now() + 11,
      errors: ['some error']
    })
    const component = renderer.create((
      <Provider store={store}>
        <ThemeProvider>
          <ImportedResults
            classes={{ }}
            account={account}
            transactions={transactions}
            errors={{ base: [], transactions: [] }}
            onSave={mockOnSave}
            onBack={mockOnBack}
          />
        </ThemeProvider>
      </Provider>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
