import React from 'react'
import renderer from 'react-test-renderer'
import { BrowserRouter } from 'react-router-dom'
import { LandingComponent } from '../'

jest.mock('../LandingCard', () => 'LandingCard')

describe('LandingCard', () => {
  it('matches snapshot', () => {
    const component = renderer.create((
      <BrowserRouter>
        <LandingComponent classes={{}} history={{}} />
      </BrowserRouter>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
