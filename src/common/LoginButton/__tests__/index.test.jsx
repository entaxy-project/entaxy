import React from 'react'
import renderer from 'react-test-renderer'
import { LoginButtonComponent } from '../'

describe('LoginButton', () => {
  const mochHandleLogin = jest.fn()
  const mochHandleLogout = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot with logged in user profile', () => {
    const component = renderer.create((
      <LoginButtonComponent
        user={{ isAuthenticatedWith: 'blockstack', name: 'Test name', username: 'Test' }}
        handleLogin={mochHandleLogin}
        handleLogout={mochHandleLogout}
        classes={{ }}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
