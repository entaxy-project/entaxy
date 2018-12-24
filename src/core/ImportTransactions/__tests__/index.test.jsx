import React from 'react'
import renderer from 'react-test-renderer'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from '../../../store'
import { ImportTransactionsComponent } from '../'

jest.mock('../../../common/Header', () => 'Header')

describe('Import Transactions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockSaveTransactions = jest.fn()

  it('matches snapshot', () => {
    const component = renderer.create((
      <Provider store={store}>
        <BrowserRouter>
          <ImportTransactionsComponent
            classes={{ }}
            saveTransactions={mockSaveTransactions}
          />
        </BrowserRouter>
      </Provider>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
