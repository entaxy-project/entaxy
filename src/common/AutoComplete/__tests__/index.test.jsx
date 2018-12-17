import React from 'react'
import renderer from 'react-test-renderer'
import DateTimeSelect from '../'

describe('DateTimeSelect', () => {
  const mochOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot', () => {
    const component = renderer.create((
      <DateTimeSelect
        label="Date"
        name="createdAt"
        value={new Date('1/1/2018')}
        onChange={mochOnChange}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
