import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { NewImportFromInstitutionComponent } from '../new'

jest.mock('../form', () => 'AccountForm')

describe('New Import From Institution', () => {
  const mochCreateAccountGroup = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot', () => {
    const component = renderer.create((
      <NewImportFromInstitutionComponent
        createAccountGroup={mochCreateAccountGroup}
        history={{}}
        match={{ params: { institution: 'TD' } }}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  describe('Component methods', () => {
    const mochHistoryPush = jest.fn()
    const wrapper = shallow((
      <NewImportFromInstitutionComponent
        createAccountGroup={mochCreateAccountGroup}
        history={{ push: mochHistoryPush }}
        match={{ params: { institution: 'TD' } }}
      />
    ))
    const instance = wrapper.instance()

    it('saves the form', async () => {
      const accountGroup = { apiKey: 'abc', apiSecret: 'def' }
      const accounts = [{ name: 'account 1' }, { name: 'account 2' }]

      instance.handleSave(accountGroup, accounts)
      expect(mochCreateAccountGroup).toHaveBeenCalled()
      expect(mochHistoryPush).toHaveBeenCalledWith('/dashboard')
    })

    it('cancels the account creation', () => {
      instance.handleCancel()
      expect(mochHistoryPush).toHaveBeenCalledWith('/dashboard')
    })
  })
})
