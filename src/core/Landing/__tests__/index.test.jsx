import React from 'react'
import renderer from 'react-test-renderer'
import { BrowserRouter } from 'react-router-dom'
import Landing from '../'

describe('LandingCard', () => {
  it('matches snapshot', () => {
    const component = renderer.create((
      <BrowserRouter>
        <Landing />
      </BrowserRouter>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
