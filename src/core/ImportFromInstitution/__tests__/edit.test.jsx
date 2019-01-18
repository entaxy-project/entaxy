import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { EditImportFromInstitutionComponent } from '../edit'

jest.mock('../form', () => 'AccountForm')

describe('New Import From Institution', () => {
  const mochUpdateAccountGroup = jest.fn()
  const mochDeleteAccountGroup = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot', () => {
    const component = renderer.create((
      <EditImportFromInstitutionComponent
        updateAccountGroup={mochUpdateAccountGroup}
        deleteAccountGroup={mochDeleteAccountGroup}
        history={{}}
        match={{ params: { institution: 'TD' } }}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  describe('Component methods', () => {
    const mochHistoryPush = jest.fn()
    const wrapper = shallow((
      <EditImportFromInstitutionComponent
        updateAccountGroup={mochUpdateAccountGroup}
        deleteAccountGroup={mochDeleteAccountGroup}
        history={{ push: mochHistoryPush }}
        match={{ params: { institution: 'TD' } }}
      />
    ))
    const instance = wrapper.instance()
    const accountGroup = { id: 'g1', apiKey: 'abc', apiSecret: 'def' }

    it('saves the form', async () => {
      const accounts = [{ name: 'account 1' }, { name: 'account 2' }]

      instance.handleSave(accountGroup, accounts)
      expect(mochUpdateAccountGroup).toHaveBeenCalled()
      expect(mochHistoryPush).toHaveBeenCalledWith('/dashboard')
    })

    // it('deletes the form', async () => {
    //   instance.handleDelete(accountGroup)
    //   expect(mochUpdateAccountGroup).toHaveBeenCalled()
    //   expect(mochHistoryPush).toHaveBeenCalledWith('/dashboard')
    // })

    it('cancels the account creation', () => {
      instance.handleCancel()
      expect(mochHistoryPush).toHaveBeenCalledWith('/dashboard')
    })
  })
})
