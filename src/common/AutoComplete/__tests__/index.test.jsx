import React from 'react'
import renderer from 'react-test-renderer'
import AutoComplete from '..'

describe('AutoComplete', () => {
  const mochOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot for simple select', () => {
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

  it('matches snapshot for async select', () => {
    const component = renderer.create((
      <AutoComplete
        async
        label="Institution"
        name="institution"
        options={[{ label: 'TD', value: 'TD' }]}
        onChange={mochOnChange}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot for creatable select', () => {
    const component = renderer.create((
      <AutoComplete
        creatable
        label="Institution"
        name="institution"
        options={[{ label: 'TD', value: 'TD' }]}
        onChange={mochOnChange}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot with error', () => {
    const component = renderer.create((
      <AutoComplete
        label="Institution"
        name="institution"
        options={[{ label: 'TD', value: 'TD' }]}
        onChange={mochOnChange}
        error
        helperText="Some error"
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
