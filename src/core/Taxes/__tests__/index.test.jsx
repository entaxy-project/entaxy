import React from 'react'
import renderer from 'react-test-renderer'
import { BrowserRouter } from 'react-router-dom'
import Taxes from '../'

describe('Taxes', () => {
  it('matches snapshot', () => {
    const component = renderer.create((
      <BrowserRouter>
        <Taxes />
      </BrowserRouter>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
