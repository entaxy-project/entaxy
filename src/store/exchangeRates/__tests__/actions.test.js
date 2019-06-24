import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as actions from '../actions'
import types from '../types'
import { initialState as settingsInitialState } from '../../settings/reducer'
import { initialState as accountsInitialState } from '../../accounts/reducer'
import { initialState as transactionsInitialState } from '../../transactions/reducer'
import { mochFetch } from '../../../setupTests'

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

const exchangeRates = {
  CAD: {
    exchangeRate: '1',
    updatedOn: '2018-11-30'
  },
  EUR: {
    exchangeRate: '2',
    updatedOn: '2018-11-30'
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

  describe('createExchangeRate', () => {
    it('should add new ExchangeRate', () => {
      expect(actions.createExchangeRate('VEE', 3, '2018-01-01')).toEqual({
        type: 'CREATE_EXCHANGE_RATE',
        payload: {
          exchangeRate: 3,
          currency: 'VEE',
          updatedOn: '2018-01-01'
        }
      })
    })
  })

  describe('updateExchangeRate', () => {
    it('should update ExchangeRate', () => {
      expect(actions.updateExchangeRate('VEE', 3, '2018-01-01')).toEqual({
        type: 'UPDATE_EXCHANGE_RATE',
        payload: {
          exchangeRate: 3,
          currency: 'VEE',
          updatedOn: '2018-01-01'
        }
      })
    })
  })

  describe('deleteExchangeRates', () => {
    it('should delete ExchangeRates', () => {
      const payload = ['CAD', 'EUR']
      expect(actions.deleteExchangeRates(payload)).toEqual({
        type: 'DELETE_EXCHANGE_RATES',
        payload
      })
    })
  })

  describe('updateExchangeRates', () => {
    it('should remove all existing ExchangeRates', () => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        settings: settingsInitialState,
        accounts: accountsInitialState,
        transactions: transactionsInitialState,
        exchangeRates
      })
      return store.dispatch(actions.updateExchangeRates())
        .then(() => {
          expect(store.getActions()).toEqual([
            {
              type: 'DELETE_EXCHANGE_RATES',
              payload: ['CAD', 'EUR']
            }
          ])
        })
    })
  })

  describe.only('fetchExchangeRates', () => {
    // Mock call to exchangeratesapi in fetchExchangeRates
    // window.fetch = jest.fn().mockImplementation(() => (
    //   Promise.resolve(new window.Response(
    //     JSON.stringify({
    //       'Realtime Currency Exchange Rate': {
    //         '6. Last Refreshed': '2018-01-01',
    //         '5. Exchange Rate': 1
    //       }
    //     }), {
    //       status: 200,
    //       headers: { 'Content-type': 'application/json' }
    //     }
    //   ))
    // ))

    it('should fetch ExchangeRates for one day', async () => {
      mochFetch({ '2019-01-02': { CAD: 1.3641309116 } })
      const rates = await actions.fetchExchangeRates(['CAD'], 'USD', '2019-01-02', '2019-01-02')
      expect(rates).toEqual({
        '2019-01-02': { CAD: 1.3641309116 }
      })
    })
    it('should fetch ExchangeRates for date range', async () => {
      mochFetch({ '2019-01-02': { CAD: 1.3641309116 } })
      const rates = await actions.fetchExchangeRates(['CAD'], 'USD', '2019-01-02', '2019-02-02')
      expect(rates).toEqual({
        '2019-01-02': { CAD: 1.3641309116 },
        '2019-01-03': { CAD: 1.3563623546 },
        '2019-01-04': { CAD: 1.3442076646 },
        '2019-01-07': { CAD: 1.3351681957 },
        '2019-01-08': { CAD: 1.3293706294 },
        '2019-01-09': { CAD: 1.3244871235 },
        '2019-01-10': { CAD: 1.3221499783 },
        '2019-01-11': { CAD: 1.3220324287 },
        '2019-01-14': { CAD: 1.3278102381 },
        '2019-01-15': { CAD: 1.3265056022 },
        '2019-01-16': { CAD: 1.3259285275 },
        '2019-01-17': { CAD: 1.3296770797 },
        '2019-01-18': { CAD: 1.3273109981 },
        '2019-01-21': { CAD: 1.3304875902 },
        '2019-01-22': { CAD: 1.33239387 },
        '2019-01-23': { CAD: 1.3312219583 },
        '2019-01-24': { CAD: 1.3367427916 },
        '2019-01-25': { CAD: 1.3314824608 },
        '2019-01-28': { CAD: 1.323787003 },
        '2019-01-29': { CAD: 1.3256872702 },
        '2019-01-30': { CAD: 1.3221629189 },
        '2019-01-31': { CAD: 1.315198468 },
        '2019-02-01': { CAD: 1.3141835934 }
      })
    })
  })
})
