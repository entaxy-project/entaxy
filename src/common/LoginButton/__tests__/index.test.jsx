import React from 'react'
import renderer from 'react-test-renderer'
import { mount } from 'enzyme'
import { LoginButtonComponent } from '../'

describe('HandleLogin', () => {
  const mochHandleLogin = jest.fn()
  const mochHandleLogout = jest.fn()
  const props = {
    classes: { }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot with logged out user', () => {
    const component = renderer.create((
      <LoginButtonComponent
        user={{ isAuthenticatedWith: null }}
        handleLogin={mochHandleLogin}
        handleLogout={mochHandleLogout}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot with logged in user profile', () => {
    const component = renderer.create((
      <LoginButtonComponent
        user={{ isAuthenticatedWith: 'blockstack', name: 'Test name', username: 'Test' }}
        handleLogin={mochHandleLogin}
        handleLogout={mochHandleLogout}
        classes={{ ...props }}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('handles login', () => {
    const wrapper = mount((
      <LoginButtonComponent
        user={{ isAuthenticatedWith: null }}
        handleLogin={mochHandleLogin}
        handleLogout={mochHandleLogout}
      />
    ))
    expect(wrapper.find('button > span').text()).toBe('Login')
    wrapper.find('button').simulate('click')
    expect(mochHandleLogin).toHaveBeenCalled()
    expect(mochHandleLogout).not.toHaveBeenCalled()
  })
})
