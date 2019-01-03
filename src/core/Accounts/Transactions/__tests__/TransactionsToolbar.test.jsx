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

    it('should show the popup menu', () => {
      expect(wrapper.state('anchorEl')).toBeNull()
      expect(wrapper.state('openPopup')).toBe(false)
      instance.showPopup({ currentTarget: <div>something</div> })
      expect(wrapper.state('anchorEl')).toEqual(<div>something</div>)
      expect(wrapper.state('openPopup')).toBe(true)
    })

    it('should close the popup menu', () => {
      expect(wrapper.state('openPopup')).toBe(true)
      instance.closePopup()
      expect(wrapper.state('openPopup')).toBe(false)
    })

    it('should handle the popup selection', () => {
      const importType = 'CSV'
      instance.handlePopupSelection(importType)
      expect(mochHistoryPush).toHaveBeenCalledWith(`/accounts/${account.id}/import/${importType}`)
    })

    it('should call reset selection', () => {
      instance.resetSelection()
      expect(wrapper.state('anchorEl')).toBeNull()
      expect(wrapper.state('openPopup')).toBe(false)
    })
  })
})
