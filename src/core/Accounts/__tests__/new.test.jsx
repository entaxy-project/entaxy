import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { NewAccountComponent } from '../new'

jest.mock('../form', () => 'AccountForm')

describe('New Account', () => {
  const mochHandleSave = jest.fn()
  const mochHandleCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot', () => {
    const component = renderer.create((
      <NewAccountComponent
        handleSave={mochHandleSave}
        handleCancel={mochHandleCancel}
        history={{}}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  describe('Component methods', () => {
    const mochHistoryPush = jest.fn()
    const wrapper = shallow((
      <NewAccountComponent
        handleSave={mochHandleSave}
        handleCancel={mochHandleCancel}
        history={{ push: mochHistoryPush }}
      />
    ))
    const instance = wrapper.instance()

    it('saves the form', async () => {
      const accountId = 'abc'
      mochHandleSave.mockImplementation(() => accountId)

      await instance.onSave({ name: 'new account' })
      expect(mochHandleSave).toHaveBeenCalled()
      expect(mochHistoryPush).toHaveBeenCalledWith(`/accounts/${accountId}/transactions`)
    })

    it('cancels the account creation', () => {
      instance.onCancel()
      expect(mochHistoryPush).toHaveBeenCalledWith('/dashboard')
    })
  })
})
