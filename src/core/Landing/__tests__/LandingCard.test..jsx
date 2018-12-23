import React from 'react'
import renderer from 'react-test-renderer'
import { BrowserRouter } from 'react-router-dom'
import { LandingCardComponent } from '../LandingCard'

describe('LandingCard', () => {
  it('matches snapshot', () => {
    const component = renderer.create((
      <BrowserRouter>
        <LandingCardComponent
          title="title"
          description="description"
          path="/taxes"
          user={{}}
          classes={{}}
          history={{}}
        />
      </BrowserRouter>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
