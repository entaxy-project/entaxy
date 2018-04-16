import React from 'react'
import renderer from 'react-test-renderer'
import App from '../'

describe('App', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<App />)
    expect(component.toJSON()).toMatchSnapshot()
  })
})
