import React from 'react'
import { render, cleanup, wait } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { UserSession } from 'blockstack'
import { store, persistor } from '../../../store'
import { blockstackUserSession } from '../../../../mocks/BlockstackMock'
import HandleBlockstackLogin from '..'

jest.mock('blockstack')
UserSession.mockImplementation(() => blockstackUserSession)
const mochHistoryPush = jest.fn()

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

afterEach(() => {
  cleanup()
})

describe('handleBlockstackLogin', () => {
  it('redirects to landing if signin not pending', () => {
    render(
      <HandleBlockstackLogin {...{ history: { push: mochHistoryPush } }} />
    )
    expect(persistor).toBeNull()
    expect(mochHistoryPush).not.toHaveBeenCalledWith('/dashboard')
    expect(mochHistoryPush).toHaveBeenCalledWith('/')
  })

  it('logs in with blockstack', async () => {
    blockstackUserSession.isSignInPending.mockReturnValue(true)
    blockstackUserSession.isUserSignedIn.mockReturnValue(true)
    render(
      <HandleBlockstackLogin {...{ history: { push: mochHistoryPush } }} />
    )
    await wait()
    expect(blockstackUserSession.handlePendingSignIn).toHaveBeenCalled()
    expect(mochHistoryPush).toHaveBeenCalledWith('/dashboard')
    expect(store.getState().user.isAuthenticatedWith).toEqual('blockstack')
    expect(store.getState().user.overlayMessage).toEqual('Loading data from Blockstack ...')
    expect(persistor).not.toBeNull()
  })

  it('reirects to root if there is an error', async () => {
    blockstackUserSession.isSignInPending.mockReturnValue(true)
    blockstackUserSession.handlePendingSignIn.mockImplementation(() => Promise.reject(new Error('reason')))
    render(
      <HandleBlockstackLogin {...{ history: { push: mochHistoryPush } }} />
    )
    await wait()
    expect(blockstackUserSession.handlePendingSignIn).toHaveBeenCalled()
    expect(mochHistoryPush).toHaveBeenCalledWith('/')
    expect(store.getState().user.isAuthenticatedWith).toEqual('blockstack')
    expect(store.getState().user.overlayMessage).toEqual('Loading data from Blockstack ...')
    expect(persistor).not.toBeNull()
  })
})
