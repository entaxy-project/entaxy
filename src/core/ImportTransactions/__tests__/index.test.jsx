import React from 'react'
import renderer from 'react-test-renderer'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from '../../../store'
import { ImportTransactionsComponent } from '../'

describe('Import Transactions', () => {
  const props = {
    classes: { }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot', () => {
    const component = renderer.create((
      <Provider store={store}>
        <BrowserRouter>
          <ImportTransactionsComponent
            classes={{ ...props }}
          />
        </BrowserRouter>
      </Provider>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
