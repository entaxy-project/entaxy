import React from 'react'
import { mount } from 'enzyme'
import ConfirmDialog from '..'

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

describe('ConfirmDialog', () => {
  const mochProceed = jest.fn()
  const mochDismiss = jest.fn()

  it('matches snapshot', () => {
    const wrapper = mount((
      <ConfirmDialog
        title="Title"
        description="Description"
        show={true}
        proceed={mochProceed}
        dismiss={mochDismiss}
      />
    ))
    expect(wrapper.debug()).toMatchSnapshot()
  })
})
