import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { initialState as settingsInitialState } from '../../settings/reducer'
import { initialState as accountsInitialState } from '../../accounts/reducer'
import { initialState as transactionsInitialState } from '../../transactions/reducer'
import { initialState as exchangeRatesInitialState } from '../../exchangeRates/reducer'
import { initialState as budgetInitialState } from '../../budget/reducer'
import * as blockstackStorage from '../blockstackStorage'
import * as localStorage from '../localStorage'
import * as storage from '..'

const mockStore = configureMockStore([thunk])
const loadStateBlockstackStorageSpy = jest.spyOn(blockstackStorage, 'loadState').mockImplementation(() => {})
const loadStateLocalStorageSpy = jest.spyOn(localStorage, 'loadState')
const saveStateBlockstackStorageSpy = jest.spyOn(blockstackStorage, 'saveState').mockImplementation(() => {})
const saveStateLocalStorageSpy = jest.spyOn(localStorage, 'saveState')

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

describe('storage', () => {
  it('should load state for guest user', () => {
    const store = mockStore({ user: { isAuthenticatedWith: 'guest' } })
    store.dispatch(storage.loadState())
    expect(loadStateBlockstackStorageSpy).not.toHaveBeenCalled()
    expect(loadStateLocalStorageSpy).toHaveBeenCalled()
    expect(store.getActions()).toEqual([{
      type: 'SHOW_OVERLAY',
      payload: 'Loading data from localStorage...'
    }])
  })

  it('should load state for blockstack user', () => {
    const store = mockStore({ user: { isAuthenticatedWith: 'blockstack' } })
    store.dispatch(storage.loadState())
    expect(loadStateBlockstackStorageSpy).toHaveBeenCalled()
    expect(loadStateLocalStorageSpy).not.toHaveBeenCalled()
    expect(store.getActions()).toEqual([{
      type: 'SHOW_OVERLAY',
      payload: 'Loading data from Blockstack...'
    }])
  })

  it('should not load if user is not logged in', () => {
    const store = mockStore({})
    store.dispatch(storage.loadState())
    expect(loadStateBlockstackStorageSpy).not.toHaveBeenCalled()
    expect(loadStateLocalStorageSpy).not.toHaveBeenCalled()
    expect(store.getActions()).toEqual([])
  })

  it('should save the current state for guest user', () => {
    const store = mockStore({ user: { isAuthenticatedWith: 'guest' } })
    store.dispatch(storage.saveState())
    expect(saveStateBlockstackStorageSpy).not.toHaveBeenCalled()
    expect(saveStateLocalStorageSpy).toHaveBeenCalled()
  })

  it('should save the current state for blockstack user', () => {
    const store = mockStore({ user: { isAuthenticatedWith: 'blockstack' } })
    store.dispatch(storage.saveState())
    expect(saveStateBlockstackStorageSpy).toHaveBeenCalled()
    expect(saveStateLocalStorageSpy).not.toHaveBeenCalled()
  })

  it('should not save if user is not logged in', () => {
    const store = mockStore()
    store.dispatch(storage.saveState())
    expect(saveStateBlockstackStorageSpy).not.toHaveBeenCalled()
    expect(saveStateLocalStorageSpy).not.toHaveBeenCalled()
  })

  it('resetState should delete all data', async () => {
    const store = mockStore({
      settings: settingsInitialState
    })
    store.dispatch(storage.resetState())
    expect(store.getActions()).toEqual([
      {
        type: 'LOAD_SETTINGS',
        payload: settingsInitialState
      },
      {
        type: 'LOAD_ACCOUNTS',
        payload: accountsInitialState
      },
      {
        type: 'LOAD_TRANSACTIONS',
        payload: transactionsInitialState
      },
      {
        type: 'LOAD_EXCHANGE_RATES',
        payload: exchangeRatesInitialState
      },
      {
        type: 'LOAD_BUDGET',
        payload: budgetInitialState
      }
    ])
  })
})
