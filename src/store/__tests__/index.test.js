import { initialState as userInitialState } from '../user/reducer'
import { initialState as settingsInitialState } from '../settings/reducer'
import { initialState as accountsInitialState } from '../accounts/reducer'
import { initialState as transactionsInitialState } from '../transactions/reducer'
import { initialState as exchangeRatesInitialState } from '../exchangeRates/reducer'
import store from '..'

describe('store', () => {
  it('gets created', () => {
    expect(store.getState()).toEqual({
      user: userInitialState,
      settings: settingsInitialState,
      accounts: accountsInitialState,
      transactions: transactionsInitialState,
      exchangeRates: exchangeRatesInitialState
    })
  })
})
