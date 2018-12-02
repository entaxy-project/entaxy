import React from 'react'
import renderer from 'react-test-renderer'
import * as blockstack from 'blockstack'
import { HandleLoginComponent } from '../'

jest.mock('blockstack', () => {
  return require('../../../../mocks/BlockstackMock')
})

describe('HandleLogin', () => {
  const mochHandlePendingSignIn = jest.fn()
  mochHandlePendingSignIn.mockReturnValue(Promise.resolve())

  it('matches snapshot with logged out user', () => {
    const component = renderer.create((
      <HandleLoginComponent
        handlePendingSignIn={mochHandlePendingSignIn}
      />
    ))
    expect(mochHandlePendingSignIn).not.toHaveBeenCalled()
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot with logged in user profile', () => {
    const isSignInPendingSpy = jest.spyOn(blockstack, 'isSignInPending')
    isSignInPendingSpy.mockReturnValue(true)

    const component = renderer.create((
      <HandleLoginComponent
        user={{ isLoginPending: true }}
        handlePendingSignIn={mochHandlePendingSignIn}
      />
    ))
    expect(mochHandlePendingSignIn).toHaveBeenCalled()
    expect(component.toJSON()).toMatchSnapshot()
  })
})
