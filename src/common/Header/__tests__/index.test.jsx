import React from 'react'
import renderer from 'react-test-renderer'
import Header from '../'

describe('Header', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<Header />)
    expect(component.toJSON()).toMatchSnapshot()
  })
})
