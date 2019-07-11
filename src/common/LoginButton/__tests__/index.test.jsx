import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { LoginButtonComponent } from '..'

describe('LoginButton', () => {
  const mochHandleLogin = jest.fn()
  const mochHandleLogout = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot with user logged in with blockstack', () => {
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

  it('matches snapshot with user logged in as guest', () => {
    const component = renderer.create((
      <LoginButtonComponent
        user={{ isAuthenticatedWith: 'guest', name: 'Test name', username: 'Test' }}
        handleLogin={mochHandleLogin}
        handleLogout={mochHandleLogout}
        classes={{ }}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  describe('Component methods', () => {
    const wrapper = shallow((
      <LoginButtonComponent
        user={{ isAuthenticatedWith: 'blockstack', name: 'Test name', username: 'Test' }}
        handleLogin={mochHandleLogin}
        handleLogout={mochHandleLogout}
        classes={{ }}
      />
    ))
    const instance = wrapper.instance()

    it('handles button click', async () => {
      wrapper.setState({ anchorEl: null, open: true })
      await instance.handleClick({ currentTarget: <div>something</div> })
      expect(wrapper.state('anchorEl')).toEqual(<div>something</div>)
      expect(wrapper.state('open')).toBe(false)
    })

    it('closes popup', async () => {
      wrapper.setState({ open: true, anchorEl: <div>something</div> })
      await instance.handleClose()
      expect(wrapper.state('open')).toBe(false)
    })
  })
})
