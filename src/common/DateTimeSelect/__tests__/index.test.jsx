import React from 'react'
import renderer from 'react-test-renderer'
import DateTimeSelect from '../'

describe('DateTimeSelect', () => {
  it('matches snapshot', () => {
    const mochOnChange = jest.fn()
    const component = renderer.create((
      <DateTimeSelect
        label="Date"
        name="createdAt"
        value={new Date('September 20th 11:36 a.m.')}
        onChange={mochOnChange}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

})
