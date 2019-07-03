import React from 'react'
import renderer from 'react-test-renderer'
import { UserSession } from 'blockstack'
import { HandleLoginComponent } from '..'
import { blockstackUserSession } from '../../../../mocks/BlockstackMock'

jest.mock('blockstack')
UserSession.mockImplementation(() => blockstackUserSession)

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

describe('HandleLogin', () => {
  const mochHandlePendingSignIn = jest.fn()
  const mochHistoryPush = jest.fn()
  mochHandlePendingSignIn.mockReturnValue(Promise.resolve())

  it('matches snapshot with logged out user', () => {
    const component = renderer.create((
      <HandleLoginComponent
        handlePendingSignIn={mochHandlePendingSignIn}
        history={{}}
      />
    ))
    expect(blockstackUserSession.handlePendingSignIn).not.toHaveBeenCalled()
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot with logged in user profile', () => {
    blockstackUserSession.isSignInPending.mockReturnValue(true)

    const component = renderer.create((
      <HandleLoginComponent
        user={{ isLoginPending: true }}
        handlePendingSignIn={mochHandlePendingSignIn}
        history={{ push: mochHistoryPush }}
      />
    ))
    expect(mochHandlePendingSignIn).toHaveBeenCalled()
    expect(component.toJSON()).toMatchSnapshot()
  })
})
