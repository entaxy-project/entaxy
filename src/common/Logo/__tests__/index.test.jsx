import React from 'react'
import renderer from 'react-test-renderer'
import Logo from '../'

describe('Logo', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<Logo />)
    expect(component.toJSON()).toMatchSnapshot()
  })
})
