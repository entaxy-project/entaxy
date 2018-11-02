import React from 'react'
import renderer from 'react-test-renderer'
import { BrowserRouter } from 'react-router-dom'
import TopNav from '../'

describe('TopNav', () => {
  it('matches snapshot', () => {
    const component = renderer.create((
      <BrowserRouter>
        <TopNav />
      </BrowserRouter>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
