import migrations from '..'
import { initialState as accountsInitialState } from '../../accounts/reducer'
import { initialState as transactionsInitialState } from '../../transactions/reducer'
import { initialState as settingsInitialState } from '../../settings/reducer'
import { initialState as exchangeRatesInitialState } from '../../exchangeRates/reducer'

describe('migrations', () => {
  it('0 - should add accountType', () => {
    const MIGRATION_VERSION = 0
    const state = {
      accounts: accountsInitialState,
      transactions: [{ name: 'new transactions' }] // some other state
    }
    expect(migrations[MIGRATION_VERSION](state)).toEqual(state)

    const account = {
      id: 0,
      groupId: 'g1',
      name: 'Checking',
      institution: 'TD',
      openingBalance: 1000,
      currency: 'USD'
    }
    state.accounts.byId[0] = account
    expect(migrations[MIGRATION_VERSION](state)).toEqual({
      ...state,
      accounts: {
        ...state.accounts,
        byId: {
          [account.id]: { ...account, accountType: 'Bank' }
        }
      }
    })
  })

  it('1 - should cleanup settings', () => {
    const MIGRATION_VERSION = 1
    const state = {
      settings: settingsInitialState,
      transactions: [{ name: 'new transactions' }] // some other state
    }
    expect(migrations[MIGRATION_VERSION](state)).toEqual(state)


    state.settings.someOtherField = 'some data'
    expect(migrations[MIGRATION_VERSION](state)).toEqual({
      ...state,
      settings: {
        currency: state.settings.currency,
        locale: state.settings.locale
      }
    })
  })

  it('2 - should update transaction amount', () => {
    const MIGRATION_VERSION = 2
    const state = {
      settings: settingsInitialState,
      transactions: transactionsInitialState,
      exchangeRates: exchangeRatesInitialState,
      someOtherState: 'some value'
    }
    expect(migrations[MIGRATION_VERSION](state)).toEqual(state)

    state.transactions = {
      list: [{ name: 'new transactions', amount: 1 }]
    }
    state.exchangeRates = {
      CAD: { 123: 1, 456: 2, dates: [123, 456] },
      USD: { 123: 1, 456: 2, dates: [123, 456] }
    }
    expect(migrations[MIGRATION_VERSION](state)).toEqual({
      ...state,
      transactions: {
        list: [{
          name: 'new transactions',
          amount: { accountCurrency: 1, localCurrency: null }
        }]
      },
      exchangeRates: {
        CAD: { 123: 1, 456: 2 },
        USD: { 123: 1, 456: 2 }
      }
    })
  })
})
