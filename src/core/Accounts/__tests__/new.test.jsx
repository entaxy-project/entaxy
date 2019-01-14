import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { NewAccountComponent } from '../new'

jest.mock('../form', () => 'AccountForm')

describe('New Account', () => {
  const mochCreateAccount = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot', () => {
    const component = renderer.create((
      <NewAccountComponent
        createAccount={mochCreateAccount}
        history={{}}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  describe('Component methods', () => {
    const mochHistoryPush = jest.fn()
    const wrapper = shallow((
      <NewAccountComponent
        createAccount={mochCreateAccount}
        history={{ push: mochHistoryPush }}
      />
    ))
    const instance = wrapper.instance()

    it('saves the form', async () => {
      const accountId = 'abc'
      mochCreateAccount.mockImplementation(() => accountId)

      await instance.handleSave({ name: 'new account' })
      expect(mochCreateAccount).toHaveBeenCalled()
      expect(mochHistoryPush).toHaveBeenCalledWith(`/accounts/${accountId}/transactions`)
    })

    it('cancels the account creation', () => {
      instance.handleCancel()
      expect(mochHistoryPush).toHaveBeenCalledWith('/dashboard')
    })
  })
})
