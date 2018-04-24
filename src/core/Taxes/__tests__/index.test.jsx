import React from 'react'
import renderer from 'react-test-renderer'
import Taxes from '../'

describe('Taxes', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<Taxes />)
    expect(component.toJSON()).toMatchSnapshot()
  })
})
