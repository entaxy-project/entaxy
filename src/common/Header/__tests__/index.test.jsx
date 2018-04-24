import React from 'react'
import renderer from 'react-test-renderer'
import { BrowserRouter } from 'react-router-dom'
import Header from '../'

describe('Header', () => {
  it('matches snapshot', () => {
    const component = renderer.create((
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
