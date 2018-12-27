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

  it('matches snapshot', () => {
    const component = renderer.create((
      <AccountFormComponent
        institutions={[{ label: 'TD', value: 'TD' }]}
        handleSubmit={mochHandleSubmit}
        values={{}}
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
