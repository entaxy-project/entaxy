import React from 'react'
import renderer from 'react-test-renderer'
import { BrowserRouter } from 'react-router-dom'
import LandingCard from '../LandingCard'

describe('LandingCard', () => {
  it('matches snapshot', () => {
    const component = renderer.create((
      <BrowserRouter>
        <LandingCard title="title" description="description" path="/taxes" />
      </BrowserRouter>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
