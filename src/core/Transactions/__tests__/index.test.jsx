import React from 'react'
import renderer from 'react-test-renderer'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from '../../../store'
import { TransactionsComponent } from '../'

describe('Transactions', () => {
  const mochHandleDelete = jest.fn()
  const mochHandleDeleteAll = jest.fn()
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
          <TransactionsComponent
            handleDelete={mochHandleDelete}
            handleDeleteAll={mochHandleDeleteAll}
            classes={{ ...props }}
          />
        </BrowserRouter>
      </Provider>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
