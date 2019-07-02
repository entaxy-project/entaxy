import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import parse from 'date-fns/parse'
import * as actions from '../actions'
import types from '../types'
import { initialState as settingsInitialState } from '../../settings/reducer'
import { initialState as accountsInitialState } from '../../accounts/reducer'
import { initialState as transactionsInitialState } from '../../transactions/reducer'
import { initialState as exchangeRatesInitialState } from '../reducer'
import { mochFetch } from '../../../setupTests'

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
            [parse(today).getTime()]: 1.1,
            dates: [parse(today).getTime()]
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
            [parse(today).getTime()]: 1.1,
            dates: [parse(today).getTime()]
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
            [parse(today).getTime()]: 1.1,
            dates: [parse(today).getTime()]
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
    it('should remove all existing ExchangeRates', () => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        settings: settingsInitialState,
        accounts: accountsInitialState,
        transactions: transactionsInitialState,
        exchangeRates
      })
      return actions.updateCurrencies(store.dispatch, store.getState())
        .then(() => {
          expect(store.getActions()).toEqual([
            {
              type: 'DELETE_CURRENCIES',
              payload: Object.keys(exchangeRates)
            }
          ])
        })
    })

    it('should add existing new currency and fetch exchange rates', () => {
      const account = {
        id: 1,
        groupId: 'g1',
        name: 'Checking',
        institution: 'TD',
        openingBalance: 1000,
        currency: 'XYZ'
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
      return actions.updateCurrencies(store.dispatch, store.getState())
        .then(() => {
          expect(store.getActions()).toEqual([
            {
              payload: { text: 'Fetching exchange rates for XYZ...' },
              type: 'SHOW_SNACKBAR'
            }, {
              payload: { '2019-01-02': { [account.currency]: 1.3 } },
              type: 'UPDATE_EXCHANGE_RATES'
            }
          ])
        })
    })

    it('should not change anything', () => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        settings: settingsInitialState,
        accounts: accountsInitialState,
        transactions: transactionsInitialState,
        exchangeRates: exchangeRatesInitialState
      })
      return actions.updateCurrencies(store.dispatch, store.getState())
        .then(() => {
          expect(store.getActions()).toEqual([])
        })
    })
  })

  describe('fetchExchangeRates', () => {
    it('should return empty array if exchange rate was not available', async () => {
      mochFetch({ base: 'EUR', rates: { } })
      const rates = await actions.fetchExchangeRates(['CAD'], 'USD', '2019-01-02', '2019-01-02')
      expect(rates).toEqual([])
    })

    it('should return empty array if an error occurred', async () => {
      mochFetch({ base: 'EUR', rates: { } }, 404)
      const rates = await actions.fetchExchangeRates(['CAD'], 'USD', '2019-01-02', '2019-01-02')
      expect(rates).toEqual([])
    })

    it('should fetch ExchangeRates for one day', async () => {
      mochFetch({
        base: 'USD',
        rates: { '2019-01-02': { CAD: 1.3 } }
      })
      const rates = await actions.fetchExchangeRates(['CAD'], 'USD', '2019-01-02', '2019-01-02')
      expect(rates).toEqual({
        '2019-01-02': { CAD: 1.3 }
      })
    })

    it('should fetch ExchangeRates for date range', async () => {
      mochFetch({
        base: 'USD',
        rates: {
          '2019-01-01': { CAD: 1.3 },
          '2019-01-02': { CAD: 1.4 }
        }
      })
      const rates = await actions.fetchExchangeRates(['CAD'], 'USD', '2019-01-01', '2019-02-02')
      expect(rates).toEqual({
        '2019-01-01': { CAD: 1.3 },
        '2019-01-02': { CAD: 1.4 }
      })
    })
  })
})
