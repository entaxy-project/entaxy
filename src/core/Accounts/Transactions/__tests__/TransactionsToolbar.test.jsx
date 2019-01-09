import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { TransactionsToolbarComponent } from '../TransactionsToolbar'

describe('TransactionsToolbar', () => {
  const account = { id: 1, name: 'Checking', institution: 'TD' }
  const mochHandleNew = jest.fn()
  const mochHandleDelete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot with no transactions', () => {
    const component = renderer.create((
      <TransactionsToolbarComponent
        classes={{}}
        history={{}}
        account={account}
        handleNew={mochHandleNew}
        handleDelete={mochHandleDelete}
        selectedTransactions={[1, 2, 3, 4]}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  describe('Component methods', () => {
    const mochHistoryPush = jest.fn()
    const wrapper = shallow((
      <TransactionsToolbarComponent
        classes={{}}
        history={{ push: mochHistoryPush }}
        account={account}
        handleNew={mochHandleNew}
        handleDelete={mochHandleDelete}
        selectedTransactions={[1, 2, 3, 4]}
      />
    ))
    const instance = wrapper.instance()

    it('should return the pageTitle', () => {
      expect(instance.pageTitle(account)).toEqual(`${account.institution} - ${account.name}`)
      expect(instance.pageTitle(null)).toBeNull()
    })
  })
})
