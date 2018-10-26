import * as blockstack from 'blockstack'
import { loadState, saveState } from '../blockstackStorage'

jest.mock('blockstack', () => {
  return require('../../../mocks/BlockstackServiceMock')
})

const isUserSignedInSpy = jest.spyOn(blockstack, 'isUserSignedIn')
const getFileSpy = jest.spyOn(blockstack, 'getFile')
const putFileSpy = jest.spyOn(blockstack, 'putFile')
getFileSpy.mockReturnValue(Promise.resolve('{}'))
putFileSpy.mockReturnValue(Promise.resolve())

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

describe('loadState', () => {
  it('returns undefined if user is not signed in', () => {
    isUserSignedInSpy.mockReturnValue(false)

    expect(loadState()).toMatchObject({})
    expect(isUserSignedInSpy).toHaveBeenCalled()
    expect(getFileSpy).not.toHaveBeenCalled()
  })

  it('returns if user is signed in', () => {
    isUserSignedInSpy.mockReturnValue(true)

    expect(loadState()).toMatchObject({})
    expect(isUserSignedInSpy).toHaveBeenCalled()
    expect(getFileSpy).toHaveBeenCalledWith('entaxy.json')
  })
})

describe('saveState', () => {
  it('returns undefined if user is not signed in', () => {
    isUserSignedInSpy.mockReturnValue(false)

    expect(saveState('test data')).toBe(undefined)
    expect(isUserSignedInSpy).toHaveBeenCalled()
    expect(putFileSpy).not.toHaveBeenCalled()
  })

  it('returns if user is signed in', () => {
    isUserSignedInSpy.mockReturnValue(true)
    const state = { user: { testField: 'test' } }

    saveState(state)
    expect(isUserSignedInSpy).toHaveBeenCalled()
    expect(putFileSpy).toHaveBeenCalledWith('entaxy.json', JSON.stringify(state))
  })
})
