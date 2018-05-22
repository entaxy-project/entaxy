import React from 'react'
import renderer from 'react-test-renderer'
import { BrowserRouter } from 'react-router-dom'
import Logo from '../'

describe('Logo', () => {
  it('matches snapshot', () => {
    const component = renderer.create((
      <BrowserRouter>
        <Logo />
      </BrowserRouter>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
