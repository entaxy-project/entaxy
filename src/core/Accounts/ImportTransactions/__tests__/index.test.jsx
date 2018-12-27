import React from 'react'
import renderer from 'react-test-renderer'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from '../../../../store'
import { ImportTransactionsComponent } from '../'

jest.mock('../../../../common/Header', () => 'Header')
jest.mock('../../../../common/InstitutionIcon', () => 'InstitutionIcon')

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
            history={{ }}
            match={{ params: { acopuntId: 1 } }}
            account={{ id: 1, description: 'TD EasyWeb', institution: 'TD' }}
            saveTransactions={mockSaveTransactions}
          />
        </BrowserRouter>
      </Provider>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
