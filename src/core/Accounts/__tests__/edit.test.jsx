import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { EditAccountComponent } from '../edit'

jest.mock('../form', () => 'AccountForm')

describe('New Account', () => {
  const mochHandleSave = jest.fn()
  const mochHandleCancel = jest.fn()
  const mochHandleDelete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot', () => {
    const component = renderer.create((
      <EditAccountComponent
        handleSave={mochHandleSave}
        handleCancel={mochHandleCancel}
        handleDelete={mochHandleDelete}
        history={{}}
        match={{ params: { accountId: 1 } }}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  describe('Component methods', () => {
    const account = {
      id: '1',
      description: 'Checking',
      institution: 'TD',
      currency: 'CAD'
    }

    const mochHistoryPush = jest.fn()
    const wrapper = shallow((
      <EditAccountComponent
        handleSave={mochHandleSave}
        handleCancel={mochHandleCancel}
        handleDelete={mochHandleDelete}
        history={{ push: mochHistoryPush }}
        match={{ params: { accountId: account.id } }}
      />
    ))
    const instance = wrapper.instance()

    it('saves the account', async () => {
      await instance.onSave(account)
      expect(mochHandleSave).toHaveBeenCalled()
      expect(mochHistoryPush).toHaveBeenCalledWith(`/accounts/${account.id}/transactions`)
    })

    it('cancels the account edit', () => {
      instance.onCancel()
      expect(mochHistoryPush).toHaveBeenCalledWith(`/accounts/${account.id}/transactions`)
    })
  })
})
