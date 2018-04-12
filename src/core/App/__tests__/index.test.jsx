import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { MemoryRouter } from 'react-router-dom'

import App from '../'

it('renders without crashing', () => {
  const div = document.createElement('div')
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
    div
  )
  unmountComponentAtNode(div)
})
