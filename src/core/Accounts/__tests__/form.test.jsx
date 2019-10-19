import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { AccountFormComponent } from '../form'
import { initialState as accountsInitialState } from '../../../store/accounts/reducer'

describe('Account form', () => {
  const mochHandleSubmit = jest.fn()
  const mochHandleChange = jest.fn()
  const mochSetFieldValue = jest.fn()
  const mochHandleDelete = jest.fn()
  const mochHandleCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot for new account', () => {
    const component = renderer.create((
      <AccountFormComponent
        institutions={[{ label: 'TD', value: 'TD' }]}
        handleSubmit={mochHandleSubmit}
        values={{ accountType: { value: 'bank', label: 'Bank' } }}
        errors={{}}
        touched={{}}
        isSubmitting={false}
        handleChange={mochHandleChange}
        setFieldValue={mochSetFieldValue}
        handleDelete={mochHandleDelete}
        handleCancel={mochHandleCancel}
        classes={{ }}
        accounts={accountsInitialState}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot for edit account', () => {
    const component = renderer.create((
      <AccountFormComponent
        institutions={[{ label: 'TD', value: 'TD' }]}
        account={{ id: 1 }}
        handleSubmit={mochHandleSubmit}
        values={{ accountType: { value: 'bank', label: 'Bank' } }}
        errors={{}}
        touched={{}}
        isSubmitting={false}
        handleChange={mochHandleChange}
        setFieldValue={mochSetFieldValue}
        handleDelete={mochHandleDelete}
        handleCancel={mochHandleCancel}
        classes={{ }}
        accounts={accountsInitialState}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  describe('Component methods', () => {
    const wrapper = shallow((
      <AccountFormComponent
        institutions={[{ label: 'TD', value: 'TD' }]}
        account={{ id: 1 }}
        handleSubmit={mochHandleSubmit}
        values={{ accountType: { value: 'bank', label: 'Bank' } }}
        errors={{}}
        touched={{}}
        isSubmitting={false}
        handleChange={mochHandleChange}
        setFieldValue={mochSetFieldValue}
        handleDelete={mochHandleDelete}
        handleCancel={mochHandleCancel}
        classes={{ }}
        accounts={accountsInitialState}
      />
    ))
    const instance = wrapper.instance()

    it('should handleInstitutionChange', () => {
      instance.setState({ hideInstitutionOptions: true })
      expect(instance.state.hideInstitutionOptions).toBeTruthy()

      instance.handleInstitutionChange([
        'institution',
        { label: 'Bank of Montreal', value: 'BMO' }
      ])
      expect(mochSetFieldValue).toHaveBeenCalled()
      expect(instance.state.hideInstitutionOptions).toBeFalsy()
    })

    it('should handleCloseInstitutionOptions', () => {
      instance.setState({ hideInstitutionOptions: false })
      expect(instance.state.hideInstitutionOptions).toBeFalsy()

      instance.handleCloseInstitutionOptions()
      expect(instance.state.hideInstitutionOptions).toBeTruthy()
    })
  })
})
