import React from 'react'
import renderer from 'react-test-renderer'
import { BrowserRouter } from 'react-router-dom'
import { LandingCardComponent } from '../LandingCard'

describe('LandingCard', () => {
  it('matches snapshot', () => {
    const mochHandleLogin = jest.fn()
    const component = renderer.create((
      <BrowserRouter>
        <LandingCardComponent
          title="title"
          description="description"
          path="/taxes"
          user={{}}
          classes={{}}
          history={{}}
          handleLogin={mochHandleLogin}
        />
      </BrowserRouter>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
