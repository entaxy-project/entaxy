import React from 'react'
import renderer from 'react-test-renderer'
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
})
