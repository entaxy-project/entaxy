import React from 'react'
import renderer from 'react-test-renderer'
import { mount } from 'enzyme'
import { LoginButtonComponent } from '../'

describe('HandleLogin', () => {
  const mochHandleLogin = jest.fn()
  const mochHandleLogout = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot with logged out user', () => {
    const component = renderer.create((
      <LoginButtonComponent
        user={{ isAuthenticated: false }}
        handleLogin={mochHandleLogin}
        handleLogout={mochHandleLogout}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot with logged in user profile', () => {
    const component = renderer.create((
      <LoginButtonComponent
        user={{ isAuthenticated: true, name: 'Test name' }}
        handleLogin={mochHandleLogin}
        handleLogout={mochHandleLogout}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('handles login', () => {
    const wrapper = mount((
      <LoginButtonComponent
        user={{ isAuthenticated: false }}
        handleLogin={mochHandleLogin}
        handleLogout={mochHandleLogout}
      />
    ))
    expect(wrapper.find('button > span').text()).toBe('Login')
    wrapper.find('button').simulate('click')
    expect(mochHandleLogin).toHaveBeenCalled()
    expect(mochHandleLogout).not.toHaveBeenCalled()
  })


  it('handles logout', () => {
    const wrapper = mount((
      <LoginButtonComponent
        user={{ isAuthenticated: true, name: 'Test user' }}
        handleLogin={mochHandleLogin}
        handleLogout={mochHandleLogout}
      />
    ))
    expect(wrapper.find('button > span').text()).toBe('Test user Logout')
    wrapper.find('button').simulate('click')
    expect(mochHandleLogin).not.toHaveBeenCalled()
    expect(mochHandleLogout).toHaveBeenCalled()
  })
})
