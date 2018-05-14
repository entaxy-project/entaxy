import React from 'react'
import renderer from 'react-test-renderer'
import { BrowserRouter } from 'react-router-dom'
import Landing from '../'

describe('LandingCard', () => {
  it('matches snapshot', () => {
    const props = {
      classes: {}
    }
    const component = renderer.create((
      <BrowserRouter>
        <Landing props={{ ...props }} />
      </BrowserRouter>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
