import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { BrowserRouter } from 'react-router-dom'
import { TransactionsToolbarComponent } from '../TransactionsToolbar'

jest.mock('../../../../util/confirm', () => jest.fn())
const confirm = require('../../../../util/confirm')

describe('TransactionsToolbar', () => {
  const account = { id: 1, name: 'Checking', institution: 'TD' }
  const mochHandleNew = jest.fn()
  const mochHandleDelete = jest.fn()
  const mochaResetSelection = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot with no selected transactions', () => {
    const component = renderer.create((
      <BrowserRouter>
        <TransactionsToolbarComponent
          classes={{}}
          history={{}}
          account={account}
          handleNew={mochHandleNew}
          handleDelete={mochHandleDelete}
          selectedTransactions={[]}
          resetSelection={mochaResetSelection}
        />
      </BrowserRouter>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot with some selected transactions', () => {
    const component = renderer.create((
      <BrowserRouter>
        <TransactionsToolbarComponent
          classes={{}}
          account={account}
          handleNew={mochHandleNew}
          handleDelete={mochHandleDelete}
          selectedTransactions={[1, 2]}
          resetSelection={mochaResetSelection}
        />
      </BrowserRouter>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  describe('Component methods', () => {
    const wrapper = shallow((
      <TransactionsToolbarComponent
        classes={{}}
        account={account}
        handleNew={mochHandleNew}
        handleDelete={mochHandleDelete}
        selectedTransactions={[1, 2, 3, 4]}
        resetSelection={mochaResetSelection}
      />
    ))
    const instance = wrapper.instance()

    it('should delete transactions', async () => {
      confirm.mockImplementation(() => Promise.resolve())

      instance.onDelete()
      await expect(confirm).toHaveBeenCalledWith('Delete selected transactions?', 'Are you sure?')
      expect(mochHandleDelete).toHaveBeenCalledWith(account, [1, 2, 3, 4])
      expect(mochaResetSelection).toHaveBeenCalled()
    })
  })
})
