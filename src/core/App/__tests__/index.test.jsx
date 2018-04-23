import React from 'react'
import renderer from 'react-test-renderer'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { mount } from 'enzyme'
import blockstack from 'blockstack'
import reducers from './../../../reducers'
import App from '../'
import actions from './../actions'

jest.mock('blockstack', () => {
  return require('../../../../mocks/BlockstackServiceMock')
})

jest.mock('./../actions', () => {
  return {
    authenticationLogin: (profile) => {
      return {
        type: 'AUTHENTICATION_LOGIN',
        profile
      }
    }
  }
})

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

const store = createStore(reducers)

describe('App', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<Provider store={store}><App /></Provider>)
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('should set the profiles if the user is already logged in', () => {
    const isUserSignedInSpy = jest.spyOn(blockstack, 'isUserSignedIn')
    const authenticationLoginSpy = jest.spyOn(actions, 'authenticationLogin')

    isUserSignedInSpy.mockReturnValue(true)

    const mockedObject = {
      name: () => {
        return null
      },
      avatarUrl: () => {
        return null
      }
    }
    blockstack.Person = jest.fn(() => mockedObject)
    mount(<Provider store={store}><App /></Provider>)
    expect(isUserSignedInSpy).toHaveBeenCalled()
    expect(authenticationLoginSpy).toHaveBeenCalled()
    expect(authenticationLoginSpy).toHaveBeenCalledWith(mockedObject)
  })
})
