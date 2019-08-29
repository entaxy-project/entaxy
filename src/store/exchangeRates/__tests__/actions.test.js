import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import toDate from 'date-fns/toDate'
import * as actions from '../actions'
import types from '../types'
import { initialState as settingsInitialState } from '../../settings/reducer'
import { initialState as accountsInitialState } from '../../accounts/reducer'
import { initialState as transactionsInitialState } from '../../transactions/reducer'
import { initialState as exchangeRatesInitialState } from '../reducer'
import { mochFetch } from '../../../setupTests'
import { fiatCurrencies, cryptoCurrencies } from '../../../data/currencies'

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

const today = Date.now()
const exchangeRates = {
  CAD: {
    [today]: 1.1,
    dates: [today]
  },
  EUR: {
    [today]: 1.2,
    dates: [today]
  }
}

describe('exchangeRates actions', () => {
  describe('loadExchangeRates', () => {
    it('should load exchangeRates', () => {
      expect(actions.loadExchangeRates(exchangeRates)).toEqual({
        type: types.LOAD_EXCHANGE_RATES,
        payload: exchangeRates
      })
    })
  })

  describe('updateExchangeRates', () => {
    it('should update ExchangeRates', () => {
      const payload = { '2018-01-01': { VEE: 3 } }
      expect(actions.updateExchangeRates(payload)).toEqual({
        type: 'UPDATE_EXCHANGE_RATES',
        payload
      })
    })
  })

  describe('convertToLocalCurrency', () => {
    it('should convert to same currency', () => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        settings: settingsInitialState,
        exchangeRates: {
          CAD: {
            [toDate(today).getTime()]: 1.1,
            dates: [toDate(today).getTime()]
          }
        }
      })
      expect(actions.convertToLocalCurrency(store.getState(), 1, settingsInitialState.currency)).toEqual(1)
    })

    it('should convert to different currency', () => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        settings: settingsInitialState,
        exchangeRates: {
          CAD: {
            [toDate(today).getTime()]: 1.1,
            dates: [toDate(today).getTime()]
          }
        }
      })
      expect(actions.convertToLocalCurrency(store.getState(), 1, 'CAD')).toEqual(1 / 1.1)
    })

    it('should return null if currency not available', () => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        settings: settingsInitialState,
        exchangeRates: {
          CAD: {
            [toDate(today).getTime()]: 1.1,
            dates: [toDate(today).getTime()]
          }
        }
      })
      expect(actions.convertToLocalCurrency(store.getState(), 1, 'XYZ')).toBeNull()
    })
  })

  describe('deleteCurrencies', () => {
    it('should delete deleteCurrencies', () => {
      const payload = ['CAD', 'EUR']
      expect(actions.deleteCurrencies(payload)).toEqual({
        type: 'DELETE_CURRENCIES',
        payload
      })
    })
  })

  describe('updateCurrencies', () => {
    it('should remove all existing ExchangeRates', async () => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        settings: settingsInitialState,
        accounts: accountsInitialState,
        transactions: transactionsInitialState,
        exchangeRates
      })
      await store.dispatch(actions.updateCurrencies())
      expect(store.getActions()).toEqual([
        {
          type: 'DELETE_CURRENCIES',
          payload: Object.keys(exchangeRates)
        }
      ])
    })

    it('should add existing new currency and fetch exchange rates', async () => {
      const account = {
        id: 1,
        groupId: 'g1',
        name: 'Checking',
        institution: 'TD',
        openingBalance: 1000,
        currency: Object.keys(fiatCurrencies)[0]
      }
      mochFetch({
        base: 'USD',
        rates: { '2019-01-02': { [account.currency]: 1.3 } }
      })
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        settings: settingsInitialState,
        accounts: { ...accountsInitialState, byId: { [account.id]: account } },
        transactions: transactionsInitialState,
        exchangeRates: exchangeRatesInitialState
      })
      await store.dispatch(actions.updateCurrencies())
      expect(store.getActions()).toEqual([
        {
          payload: { text: `Fetching exchange rates for ${account.currency}...` },
          type: 'SHOW_SNACKBAR'
        }, {
          payload: { '2019-01-02': { [account.currency]: 1.3 } },
          type: 'UPDATE_EXCHANGE_RATES'
        }
      ])
    })

    it('should not change anything', async () => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        settings: settingsInitialState,
        accounts: accountsInitialState,
        transactions: transactionsInitialState,
        exchangeRates: exchangeRatesInitialState
      })
      await store.dispatch(actions.updateCurrencies())
      expect(store.getActions()).toEqual([])
    })
  })

  describe('fetchExchangeRates', () => {
    it('should not update anything if exchange rate was not available', async () => {
      mochFetch({ base: 'EUR', rates: { } })
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        settings: settingsInitialState
      })
      await store.dispatch(actions.fetchExchangeRates(['CAD']))
      expect(store.getActions()).toEqual([
        {
          payload: { text: 'Fetching exchange rates for CAD...' },
          type: 'SHOW_SNACKBAR'
        }
      ])
    })

    it('should save fiat exchange rates', async () => {
      const fiatCurrency = Object.keys(fiatCurrencies)[2]
      expect(fiatCurrency).not.toEqual(settingsInitialState.currency)
      mochFetch({
        base: settingsInitialState.currency,
        rates: { '2019-01-02': { [fiatCurrency]: 1.3 } }
      })
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        settings: settingsInitialState
      })
      await store.dispatch(actions.fetchExchangeRates([fiatCurrency]))
      expect(store.getActions()).toEqual([
        {
          payload: { text: `Fetching exchange rates for ${fiatCurrency}...` },
          type: 'SHOW_SNACKBAR'
        }, {
          payload: { '2019-01-02': { [fiatCurrency]: 1.3 } },
          type: 'UPDATE_EXCHANGE_RATES'
        }
      ])
    })

    it('should save crypto exchange rates', async () => {
      const cryptoCurrency = Object.keys(cryptoCurrencies)[2]
      expect(cryptoCurrency).not.toEqual(settingsInitialState.currency)
      mochFetch({
        base: settingsInitialState.currency,
        rates: { '2019-01-02': { [cryptoCurrency]: 1.3 } }
      })
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        settings: settingsInitialState
      })
      await store.dispatch(actions.fetchExchangeRates([cryptoCurrency]))
      expect(store.getActions()).toEqual([
        {
          payload: { text: `Fetching exchange rates for ${cryptoCurrency}...` },
          type: 'SHOW_SNACKBAR'
        }
        // , {
        //   payload: { '2019-01-02': { [cryptoCurrency]: 1.3 } },
        //   type: 'UPDATE_EXCHANGE_RATES'
        // }
      ])
    })
  })

  describe('fetchFiatExchangeRates', () => {
    it('should return empty array if exchange rate was not available', async () => {
      mochFetch({ base: 'EUR', rates: { } })
      const result = await actions.fetchFiatExchangeRates(['CAD'], 'USD', today, today)
      expect(result).toEqual([])
    })

    it('should return empty array if an error occurred', async () => {
      mochFetch({ base: 'EUR', rates: { } }, 404)
      const result = await actions.fetchFiatExchangeRates(['CAD'], 'USD', today, today)
      expect(result).toEqual([])
    })

    it('should return exchange rates', async () => {
      mochFetch({
        base: 'USD',
        rates: { '2019-01-02': { CAD: 1.3 } }
      })
      const result = await actions.fetchFiatExchangeRates(['CAD'], 'USD', today, today)
      expect(result).toEqual({
        '2019-01-02': { CAD: 1.3 }
      })
    })
  })
})
