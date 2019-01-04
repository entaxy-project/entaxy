import React from 'react'
import renderer from 'react-test-renderer'
import { AccountFormComponent } from '../form'

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
        values={{}}
        errors={{}}
        touched={{}}
        isSubmitting={false}
        handleChange={mochHandleChange}
        setFieldValue={mochSetFieldValue}
        handleDelete={mochHandleDelete}
        handleCancel={mochHandleCancel}
        classes={{ }}
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
        values={{}}
        errors={{}}
        touched={{}}
        isSubmitting={false}
        handleChange={mochHandleChange}
        setFieldValue={mochSetFieldValue}
        handleDelete={mochHandleDelete}
        handleCancel={mochHandleCancel}
        classes={{ }}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
