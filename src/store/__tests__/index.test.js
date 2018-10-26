import { initialState as userInitialState } from '../user/reducer'
import { initialState as settingsInitialState } from '../settings/reducer'
import { initialState as marketValuesInitialState } from '../marketValues/reducer'
import { initialState as transactionsInitialState } from '../transactions/reducer'
import store from '../'

describe('store', () => {
  it('gets created', () => {
    expect(store.getState()).toEqual({
      user: userInitialState,
      settings: settingsInitialState,
      marketValues: marketValuesInitialState,
      transactions: transactionsInitialState
    })
  })
})
