import React from 'react'
import renderer from 'react-test-renderer'
import { HandleLoginComponent } from '../'

describe('HandleLogin', () => {
  const mochHandlePendingSignIn = jest.fn()

  it('matches snapshot with logged out user', () => {
    const component = renderer.create((
      <HandleLoginComponent
        handlePendingSignIn={jest.fn()}
      />
    ))
    expect(mochHandlePendingSignIn).not.toHaveBeenCalled()
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot with logged in user profile', () => {
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
