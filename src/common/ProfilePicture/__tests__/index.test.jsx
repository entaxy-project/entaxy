import React from 'react'
import renderer from 'react-test-renderer'
import { mount } from 'enzyme'
import ProfilePicture from '../'
import BlockstackService from './../../../lib/BlockstackService'

jest.mock('./../../../lib/BlockstackService', () => {
  return require('../../../../mocks/BlockstackServiceMock')
})

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

describe('ProfilePicture', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<ProfilePicture />)
    expect(component.toJSON()).toMatchSnapshot()
  })

  describe('logged in state', () => {
    it('should render the logout button', () => {
      const spy = jest.spyOn(BlockstackService, 'isUserSignedIn')
      spy.mockReturnValue(true)
      BlockstackService.Person = jest.fn(() => {
        return {
          name: () => {
            return 'Named Person'
          },
          avatarUrl: () => {
            return 'http://example.com/example.png'
          }
        }
      })

      const wrapper = mount(<ProfilePicture />)
      const { alt, src } = wrapper.find('img').props()
      expect(alt).toEqual('Named Person')
      expect(src).toEqual('http://example.com/example.png')
    })

    it('should render the name as nameless person if the name is not provided', () => {
      const spy = jest.spyOn(BlockstackService, 'isUserSignedIn')
      spy.mockReturnValue(true)

      BlockstackService.Person = jest.fn(() => {
        return {
          name: () => {
            return null
          },
          avatarUrl: () => {
            return null
          }
        }
      })

      const wrapper = mount(<ProfilePicture />)
      const { alt, src } = wrapper.find('img').props()
      expect(alt).toEqual('Nameless Person')
      expect(src).toBeNull()
    })
  })

  describe('logged out state', () => {
    it('should render no profile picture', () => {
      const spy = jest.spyOn(BlockstackService, 'isUserSignedIn')
      spy.mockReturnValue(false)
      const wrapper = mount(<ProfilePicture />)
      expect(wrapper.find('img').length).toBe(0)
      expect(spy).toHaveBeenCalled()
    })
  })
})
