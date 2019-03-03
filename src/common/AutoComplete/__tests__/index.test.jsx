import React from 'react'
import renderer from 'react-test-renderer'
import AutoComplete from '..'

describe('AutoComplete', () => {
  const mochOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot', () => {
    const component = renderer.create((
      <AutoComplete
        label="Institution"
        name="institution"
        options={[{ label: 'TD', value: 'TD' }]}
        onChange={mochOnChange}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
