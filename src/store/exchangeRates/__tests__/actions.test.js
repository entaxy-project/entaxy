/* eslint-disable no-plusplus */
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {
  subDays,
  isFriday,
  addDays,
  startOfYesterday
} from 'date-fns'
import * as actions from '../actions'
import types from '../types'
import { initialState as settingsInitialState } from '../../settings/reducer'
import { initialState as accountsInitialState } from '../../accounts/reducer'
import { initialState as transactionsInitialState } from '../../transactions/reducer'
import { initialState as exchangeRatesInitialState } from '../reducer'
import {
  mockFetch,
  expectExchangeratesApiToHaveBeenCalledWith,
  generateFiatExchangeRatesResponse,
  generateExchangeRates
} from '../../../setupTests'
import { fiatCurrencies, cryptoCurrencies } from '../../../data/currencies'

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

const mockStore = configureMockStore([thunk])

describe('exchangeRates actions', () => {
  it('should load exchangeRates', () => {
    const payload = generateExchangeRates({
      currencies: ['CAD', 'USD'],
      startAt: subDays(new Date('Fri Sep 20 2019'), 10),
      endAt: new Date('Fri Sep 20 2019')
    })
    expect(actions.loadExchangeRates(payload)).toEqual({
      type: types.LOAD_EXCHANGE_RATES,
      payload
    })
  })

  it('should reset exchangeRates', () => {
    expect(actions.resetExchangeRates()).toEqual({
      type: types.LOAD_EXCHANGE_RATES
    })
  })

  it('should update ExchangeRates', () => {
    const payload = { '2018-01-01': { VEE: 3 } }
    expect(actions.updateExchangeRates(payload)).toEqual({
      type: 'UPDATE_EXCHANGE_RATES',
      payload
    })
  })

  it('should deleteCurrencies', () => {
    const payload = ['CAD', 'EUR']
    expect(actions.deleteCurrencies(payload)).toEqual({
      type: 'DELETE_CURRENCIES',
      payload
    })
  })

  describe('convertToCurrency', () => {
    it('should convert to same currency', () => {
      const srcCurrency = 'XYZ'
      const exchangeRates = generateExchangeRates({
        currencies: ['CAD', 'USD'],
        startAt: subDays(new Date('Fri Sep 20 2019'), 10),
        endAt: new Date('Fri Sep 20 2019')
      })
      const store = mockStore({
        settings: { currency: srcCurrency },
        exchangeRates
      })
      expect(Object.keys(exchangeRates)).not.toContain(srcCurrency)
      expect(store.dispatch(actions.convertToCurrency(1, srcCurrency))).toEqual(1)
    })

    it('should return null if currency not available', () => {
      const srcCurrency = 'ABC'
      const exchangeRates = generateExchangeRates({
        currencies: ['EUR'],
        startAt: subDays(new Date('Fri Sep 20 2019'), 10),
        endAt: new Date('Fri Sep 20 2019')
      })
      const store = mockStore({
        settings: settingsInitialState,
        exchangeRates
      })
      expect(Object.keys(exchangeRates)).not.toContain(srcCurrency)
      expect(Object.keys(exchangeRates)).not.toContain(store.getState().settings.currency)
      expect(store.dispatch(actions.convertToCurrency(1, srcCurrency))).toBeNull()
    })

    it('should return null if currency is available but no close exchange rate', () => {
      const srcCurrency = 'EUR'
      const exchangeRates = generateExchangeRates({
        currencies: [srcCurrency],
        startAt: subDays(new Date('Fri Sep 20 2019'), 10),
        endAt: new Date('Fri Sep 20 2019')
      })
      const store = mockStore({
        settings: settingsInitialState,
        exchangeRates
      })
      const prevMonth = subDays(new Date('Fri Sep 20 2019'), 30)
      expect(Object.keys(exchangeRates)).toContain(srcCurrency)
      expect(Object.keys(exchangeRates)).not.toContain(store.getState().settings.currency)
      expect(Object.keys(exchangeRates[srcCurrency])).not.toContain(prevMonth.toString())
      expect(store.dispatch(actions.convertToCurrency(1, srcCurrency, prevMonth))).toBeNull()
    })

    it('should convert currency for an exact date', () => {
      const srcCurrency = 'CAD'
      const endAt = new Date('Fri Sep 20 2019').getTime()
      const exchangeRates = generateExchangeRates({
        currencies: ['CAD', 'EUR'],
        startAt: subDays(endAt, 10),
        endAt
      })
      const store = mockStore({
        settings: settingsInitialState,
        exchangeRates
      })
      expect(Object.keys(exchangeRates)).toContain(srcCurrency)
      expect(Object.keys(exchangeRates)).not.toContain(store.getState().settings.currency)
      expect(Object.keys(exchangeRates[srcCurrency])[0]).toEqual(endAt.toString())
      expect(store.dispatch(actions.convertToCurrency(1, srcCurrency, endAt)))
        .toBe(1 / exchangeRates[srcCurrency][endAt])
    })

    it('should convert currency for a close non existing date', () => {
      const srcCurrency = 'CAD'
      const endAt = new Date('Fri Sep 20 2019').getTime()
      const exchangeRates = generateExchangeRates({
        currencies: ['CAD', 'EUR'],
        startAt: subDays(new Date('Fri Sep 20 2019'), 10),
        endAt
      })
      const store = mockStore({
        settings: settingsInitialState,
        exchangeRates
      })
      expect(isFriday(endAt)).toBe(true)
      const saturday = addDays(endAt, 1).getTime()
      expect(Object.keys(exchangeRates)).toContain(srcCurrency)
      expect(Object.keys(exchangeRates)).not.toContain(store.getState().settings.currency)
      expect(Object.keys(exchangeRates[srcCurrency])).not.toContain(saturday.toString())
      expect(store.dispatch(actions.convertToCurrency(1, srcCurrency, saturday)))
        .toBe(1 / exchangeRates[srcCurrency][endAt])
    })
  })

  describe('updateCurrencies', () => {
    it('should remove all existing ExchangeRates', async () => {
      const endAt = new Date('Fri Sep 20 2019').getTime()
      const exchangeRates = generateExchangeRates({
        currencies: ['CAD', 'USD'],
        startAt: subDays(endAt, 10),
        endAt
      })
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

    it('should add currency from new accounts and fetch exchange rates', async () => {
      const account = { id: 1, currency: Object.keys(fiatCurrencies)[0] }
      const store = mockStore({
        accounts: { ...accountsInitialState, byId: { [account.id]: account } },
        transactions: transactionsInitialState,
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState
      })

      const lastWeekday = actions.getLastWeekday()
      const fetchMochParams = {
        base: store.getState().settings.currency,
        symbols: [account.currency],
        startAt: subDays(lastWeekday, 10), // Should request the 10 previous days
        endAt: lastWeekday
      }
      const fetchResponse = generateFiatExchangeRatesResponse(fetchMochParams)
      const mockSpy = mockFetch(fetchResponse)
      await store.dispatch(actions.updateCurrencies())
      expect(store.getActions()).toEqual([
        {
          payload: { text: `Fetching exchange rates for ${account.currency}...` },
          type: 'SHOW_SNACKBAR'
        }, {
          payload: fetchResponse.rates,
          type: 'UPDATE_EXCHANGE_RATES'
        }
      ])
      expectExchangeratesApiToHaveBeenCalledWith({ mockSpy, ...fetchMochParams })
    })

    it('should not add currency from new account if it matches local currency', async () => {
      const settings = settingsInitialState
      const account = { id: 1, currency: settings.currency }
      const store = mockStore({
        settings,
        accounts: { ...accountsInitialState, byId: { [account.id]: account } },
        transactions: transactionsInitialState,
        exchangeRates: exchangeRatesInitialState
      })

      const mockSpy = mockFetch(null)
      await store.dispatch(actions.updateCurrencies())
      expect(store.getActions()).toEqual([])
      expect(mockSpy).not.toHaveBeenCalled()
    })

    it('should not fetch exchange from existing account if they already exist', async () => {
      const endAt = new Date('Mon, Sep 16 2019').getTime()
      const exchangeRates = generateExchangeRates({
        currencies: ['EUR'],
        startAt: subDays(endAt, 10),
        endAt: startOfYesterday()
      })
      const accounts = {
        byId: {
          0: { id: 1, currency: Object.keys(fiatCurrencies)[0] },
          1: { id: 2, currency: Object.keys(fiatCurrencies)[0] }
        }
      }
      const store = mockStore({
        settings: settingsInitialState,
        accounts: { ...accountsInitialState, ...accounts },
        transactions: transactionsInitialState,
        exchangeRates
      })

      const mockSpy = mockFetch(null)
      await store.dispatch(actions.updateCurrencies())
      expect(store.getActions()).toEqual([])
      expect(mockSpy).not.toHaveBeenCalled()
    })

    it('should not change anything for empty state', async () => {
      const store = mockStore({
        settings: settingsInitialState,
        accounts: accountsInitialState,
        transactions: transactionsInitialState,
        exchangeRates: exchangeRatesInitialState
      })
      await store.dispatch(actions.updateCurrencies())
      expect(store.getActions()).toEqual([])
    })

    it('should fetch exchange if forced date exists', async () => {
      const accountCurrencies = [
        Object.keys(fiatCurrencies)[0],
        Object.keys(fiatCurrencies)[2],
        Object.keys(fiatCurrencies)[3]
      ]
      const accounts = {
        byId: {
          0: { id: 1, currency: accountCurrencies[0] },
          1: { id: 2, currency: accountCurrencies[1] }
        }
      }
      const store = mockStore({
        settings: settingsInitialState,
        accounts: { ...accountsInitialState, ...accounts },
        transactions: transactionsInitialState,
        exchangeRates: exchangeRatesInitialState
      })
      const lastWeekday = actions.getLastWeekday()
      const fetchMochParams = {
        base: store.getState().settings.currency,
        symbols: [accountCurrencies[0]],
        startAt: subDays(lastWeekday, 100 + 10), // Should request the 10 previous days
        endAt: lastWeekday
      }
      const fetchResponse1 = generateFiatExchangeRatesResponse(fetchMochParams)
      const fetchResponse2 = generateFiatExchangeRatesResponse({ ...fetchMochParams, symbols: [accountCurrencies[1]] })
      const fetchResponse3 = generateFiatExchangeRatesResponse({
        ...fetchMochParams,
        symbols: [accountCurrencies[2]],
        startAt: subDays(lastWeekday, 15 + 10) // Should request the 10 previous days
      })
      const mockSpy = jest.fn().mockImplementationOnce(() => (
        Promise.resolve(new window.Response(
          JSON.stringify(fetchResponse1),
          { status: 200, headers: { 'Content-type': 'application/json' } }
        ))
      )).mockImplementationOnce(() => (
        Promise.resolve(new window.Response(
          JSON.stringify(fetchResponse2),
          { status: 200, headers: { 'Content-type': 'application/json' } }
        ))
      )).mockImplementationOnce(() => (
        Promise.resolve(new window.Response(
          JSON.stringify(fetchResponse3),
          { status: 200, headers: { 'Content-type': 'application/json' } }
        ))
      ))
      window.fetch = mockSpy
      await store.dispatch(actions.updateCurrencies({
        forceStarDates: {
          [accountCurrencies[0]]: subDays(lastWeekday, 100).getTime(),
          [accountCurrencies[1]]: subDays(lastWeekday, 100).getTime(),
          [accountCurrencies[2]]: subDays(lastWeekday, 15).getTime()
        }
      }))
      expect(store.getActions()).toEqual([
        {
          payload: { text: `Fetching exchange rates for ${accountCurrencies[0]}...` },
          type: 'SHOW_SNACKBAR'
        }, {
          payload: { text: `Fetching exchange rates for ${accountCurrencies[1]}...` },
          type: 'SHOW_SNACKBAR'
        }, {
          payload: { text: `Fetching exchange rates for ${accountCurrencies[2]}...` },
          type: 'SHOW_SNACKBAR'
        }, {
          payload: fetchResponse1.rates,
          type: 'UPDATE_EXCHANGE_RATES'
        }, {
          payload: fetchResponse2.rates,
          type: 'UPDATE_EXCHANGE_RATES'
        }, {
          payload: fetchResponse3.rates,
          type: 'UPDATE_EXCHANGE_RATES'
        }
      ])
      expectExchangeratesApiToHaveBeenCalledWith({ mockSpy, ...fetchMochParams })
      expectExchangeratesApiToHaveBeenCalledWith({
        mockSpy,
        ...{ ...fetchMochParams, symbols: [accountCurrencies[1]] }
      })
      expectExchangeratesApiToHaveBeenCalledWith({
        mockSpy,
        ...{ ...fetchMochParams, symbols: [accountCurrencies[2]], startAt: subDays(lastWeekday, 15 + 10) }
      })
    })


    it('should fetch missing exchange rates for transactions', async () => {
      const lastWeekday = actions.getLastWeekday()
      const account = { id: 1, currency: Object.keys(fiatCurrencies)[0] }
      const transaction = {
        id: 1,
        accountId: account.id,
        createdAt: subDays(lastWeekday, 100).getTime(),
        amount: { accountCurrency: 20 }
      }
      const store = mockStore({
        settings: settingsInitialState,
        accounts: { ...accountsInitialState, byId: { [account.id]: account } },
        transactions: { ...transactionsInitialState, list: [transaction] },
        exchangeRates: generateExchangeRates({
          currencies: [account.currency],
          startAt: subDays(lastWeekday, 10),
          endAt: lastWeekday
        })

      })
      const fetchMochParams = {
        base: store.getState().settings.currency,
        symbols: [account.currency],
        startAt: subDays(lastWeekday, 110), // Should request the 10 previous days
        endAt: lastWeekday
      }
      const fetchResponse = generateFiatExchangeRatesResponse(fetchMochParams)
      const mockSpy = mockFetch(fetchResponse)
      await store.dispatch(actions.updateCurrencies())
      expect(store.getActions()).toEqual([
        {
          payload: { text: `Fetching exchange rates for ${account.currency}...` },
          type: 'SHOW_SNACKBAR'
        }, {
          payload: fetchResponse.rates,
          type: 'UPDATE_EXCHANGE_RATES'
        }
      ])
      expectExchangeratesApiToHaveBeenCalledWith({ mockSpy, ...fetchMochParams })
    })
  })

  describe('fetchExchangeRatesFor', () => {
    it('should not update anything if exchange rate was not available', async () => {
      mockFetch({ base: 'EUR', rates: { } })
      const today = startOfYesterday()
      const store = mockStore({
        settings: settingsInitialState
      })
      await store.dispatch(actions.fetchExchangeRatesFor('CAD', today, today))
      expect(store.getActions()).toEqual([
        {
          payload: { text: 'Fetching exchange rates for CAD...' },
          type: 'SHOW_SNACKBAR'
        }
      ])
    })

    it('should save fiat exchange rates', async () => {
      const today = startOfYesterday()
      const fiatCurrency = Object.keys(fiatCurrencies)[2]
      expect(fiatCurrency).not.toEqual(settingsInitialState.currency)
      mockFetch({
        base: settingsInitialState.currency,
        rates: { '2019-01-02': { [fiatCurrency]: 1.3 } }
      })
      const store = mockStore({
        settings: settingsInitialState
      })
      await store.dispatch(actions.fetchExchangeRatesFor(fiatCurrency, today, today))
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
      mockFetch({
        base: settingsInitialState.currency,
        rates: { '2019-01-02': { [cryptoCurrency]: 1.3 } }
      })
      const store = mockStore({
        settings: settingsInitialState
      })
      await store.dispatch(actions.fetchExchangeRatesFor(cryptoCurrency))
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
      const today = startOfYesterday()
      mockFetch({ base: 'EUR', rates: { } })
      const result = await actions.fetchFiatExchangeRates(['CAD'], 'USD', today, today)
      expect(result).toEqual({})
    })

    it('should return empty array if an error occurred', async () => {
      const today = startOfYesterday()
      mockFetch({ base: 'EUR', rates: { } }, 404)
      const result = await actions.fetchFiatExchangeRates(['CAD'], 'USD', today, today)
      expect(result).toEqual({})
    })

    it('should return exchange rates', async () => {
      const today = startOfYesterday()
      mockFetch({
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
