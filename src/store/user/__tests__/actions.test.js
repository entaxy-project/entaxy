import { UserSession, Person } from 'blockstack'
import * as actions from '../actions'
import types from '../types'
import { blockstackUserSession, blockstackPerson } from '../../../../mocks/BlockstackMock'

jest.mock('blockstack')
UserSession.mockImplementation(() => blockstackUserSession)
Person.mockImplementation(() => blockstackPerson)

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

describe('user actions', () => {
  const dispatch = jest.fn()

  afterEach(() => {
    dispatch.mockClear()
  })

  it('should updateLoginData', () => {
    const payload = {
      isAuthenticatedWith: 'blockstack',
      username: 'mocked username',
      name: 'mocked name',
      pictureUrl: 'mocked url'
    }
    expect(actions.updateLoginData(payload)).toEqual({
      type: types.UPDATE_LOGIN_DATA,
      payload
    })
  })

  it('should set userLoginError', () => {
    expect(actions.userLoginError({ message: 'Error' })).toEqual({
      type: types.USER_LOGIN_ERROR,
      payload: { message: 'Error' }
    })
  })

  it('should showOverlayr', () => {
    expect(actions.showOverlay('Test message')).toEqual({
      type: types.SHOW_OVERLAY,
      payload: 'Test message'
    })
  })

  it('should showOverlayr', () => {
    expect(actions.hideOverlay()).toEqual({
      type: types.HIDE_OVERLAY
    })
  })
})
