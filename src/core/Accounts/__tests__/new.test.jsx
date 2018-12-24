import React from 'react'
import renderer from 'react-test-renderer'
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
})
