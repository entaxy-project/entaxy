import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { EditAccountComponent } from '../edit'

jest.mock('../form', () => 'AccountForm')
jest.mock('../../../util/confirm', () => jest.fn())
const confirm = require('../../../util/confirm')

describe('New Account', () => {
  const mochHandleUpdate = jest.fn()
  const mochHandleCancel = jest.fn()
  const mochHandleDelete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot', () => {
    const component = renderer.create((
      <EditAccountComponent
        handleUpdate={mochHandleUpdate}
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
        handleUpdate={mochHandleUpdate}
        handleCancel={mochHandleCancel}
        handleDelete={mochHandleDelete}
        history={{ push: mochHistoryPush }}
        match={{ params: { accountId: account.id } }}
      />
    ))
    const instance = wrapper.instance()

    it('should save the account', async () => {
      await instance.onSave(account)
      expect(mochHandleUpdate).toHaveBeenCalled()
      expect(mochHistoryPush).toHaveBeenCalledWith(`/accounts/${account.id}/transactions`)
    })

    it('should cancel the account edit', () => {
      instance.onCancel()
      expect(mochHistoryPush).toHaveBeenCalledWith(`/accounts/${account.id}/transactions`)
    })

    it('should delete the account', async () => {
      confirm.mockImplementation(() => Promise.resolve())

      instance.onDelete(account)
      await expect(confirm).toHaveBeenCalledWith('Delete selected account?', 'Are you sure?')
      await expect(mochHandleDelete).toHaveBeenCalledWith(account)
      expect(mochHistoryPush).toHaveBeenCalledWith('/dashboard')
    })
  })
})
