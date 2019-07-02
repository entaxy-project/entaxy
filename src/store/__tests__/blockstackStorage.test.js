import { UserSession } from 'blockstack'
import { loadState, saveState } from '../blockstackStorage'
import { blockstackUserSession } from '../../../mocks/BlockstackMock'

jest.mock('blockstack')
UserSession.mockImplementation(() => blockstackUserSession)

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

describe('loadState', () => {
  it('returns undefined if user is not signed in', () => {
    blockstackUserSession.isUserSignedIn.mockReturnValue(false)

    expect(loadState()).toMatchObject({})
    expect(blockstackUserSession.isUserSignedIn).toHaveBeenCalled()
    expect(blockstackUserSession.getFile).not.toHaveBeenCalled()
  })

  it('returns if user is signed in', () => {
    blockstackUserSession.isUserSignedIn.mockReturnValue(true)

    expect(loadState()).toMatchObject({})
    expect(blockstackUserSession.isUserSignedIn).toHaveBeenCalled()
    expect(blockstackUserSession.getFile).toHaveBeenCalledWith('entaxy.json')
  })
})

describe('saveState', () => {
  it('returns undefined if user is not signed in', () => {
    blockstackUserSession.isUserSignedIn.mockReturnValue(false)

    expect(saveState('test data')).toBe(undefined)
    expect(blockstackUserSession.isUserSignedIn).toHaveBeenCalled()
    expect(blockstackUserSession.putFile).not.toHaveBeenCalled()
  })

  it('returns if user is signed in', () => {
    blockstackUserSession.isUserSignedIn.mockReturnValue(true)
    const state = { user: { testField: 'test' } }

    saveState(state)
    expect(blockstackUserSession.isUserSignedIn).toHaveBeenCalled()
    expect(blockstackUserSession.putFile).toHaveBeenCalledWith('entaxy.json', JSON.stringify(state))
  })
})
