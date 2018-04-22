import React from 'react'
import renderer from 'react-test-renderer'
import { mount, render } from 'enzyme'
import Button from 'material-ui/Button'
import blockstack from 'blockstack'
import AuthenticationButton from '../'

jest.mock('blockstack', () => {
  return require('../../../../mocks/BlockstackServiceMock')
})

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

describe('AuthenticationButton', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<AuthenticationButton />)
    expect(component.toJSON()).toMatchSnapshot()
  })

  describe('logged in state', () => {
    it('should render the logout button', () => {
      const spy = jest.spyOn(blockstack, 'isUserSignedIn')
      spy.mockReturnValue(true)
      expect(render(<AuthenticationButton />).text()).toEqual('mocked name Logout')
      expect(spy).toHaveBeenCalled()
    })

    it('should render the name as nameless person if the name is not provided', () => {
      const spy = jest.spyOn(blockstack, 'isUserSignedIn')
      spy.mockReturnValue(true)

      blockstack.Person = jest.fn(() => {
        return {
          name: () => {
            return null
          }
        }
      })

      expect(render(<AuthenticationButton />).text()).toEqual('Nameless Person Logout')
      expect(spy).toHaveBeenCalled()
    })

    it('should call signUserOut when clicking the logout button', () => {
      const signUserOutSpy = jest.spyOn(blockstack, 'signUserOut')
      const isSignInPendingSpy = jest.spyOn(blockstack, 'isSignInPending')
      isSignInPendingSpy.mockReturnValue(false)
      const spy = jest.spyOn(blockstack, 'isUserSignedIn')
      spy.mockReturnValue(true)
      const wrapper = mount(<AuthenticationButton />)
      wrapper.find(Button).simulate('click')
      expect(signUserOutSpy.mock.calls.length).toBe(1)
    })
  })

  describe('logged out state', () => {
    it('should render the login button', () => {
      const spy = jest.spyOn(blockstack, 'isUserSignedIn')
      spy.mockReturnValue(false)
      expect(render(<AuthenticationButton />).text()).toEqual('Login')
      expect(spy).toHaveBeenCalled()
    })

    it('should call redirectToSignIn when clicking the login button', () => {
      const redirectToSignInSpy = jest.spyOn(blockstack, 'redirectToSignIn')
      const isSignInPendingSpy = jest.spyOn(blockstack, 'isSignInPending')
      isSignInPendingSpy.mockReturnValue(false)
      const wrapper = mount(<AuthenticationButton />)
      wrapper.find(Button).simulate('click')
      expect(redirectToSignInSpy.mock.calls.length).toBe(1)
    })
  })
})
