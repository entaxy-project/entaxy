import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { startOfYesterday, format } from 'date-fns'
import * as actions from '../actions'
import types from '../types'
import { mockFetch } from '../../../setupTests'
import { initialState as transactionsInitialState } from '../../transactions/reducer'

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

describe('settings actions', () => {
  describe('updateSettings', () => {
    it('should update settings', async () => {
      const account = { id: 0, currency: 'EUR', currentBalance: { accountCurrency: 1, localCurrency: 1 } }
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        settings: { locale: 'en-US', currency: 'USD' },
        accounts: { byId: { 0: account } },
        exchangeRates: { CAD: { 123: 1 } },
        transactions: transactionsInitialState
      })
      mockFetch({
        base: 'CAD',
        rates: { [format(startOfYesterday(), 'yyyy-MM-dd')]: { EUR: 1.3 } }
      })

      await store.dispatch(actions.updateSettings({ locale: 'en-CA', currency: 'CAD' })).then(() => {
        expect(store.getActions()).toEqual([
          {
            type: types.UPDATE_SETTINGS,
            payload: { locale: 'en-CA', currency: 'CAD' }
          }, {
            type: 'LOAD_EXCHANGE_RATES'
          }, {
            type: 'DELETE_CURRENCIES',
            payload: ['CAD']
          }, {
            type: 'SHOW_SNACKBAR',
            payload: { text: 'Fetching exchange rates for EUR...' }
          }, {
            type: 'UPDATE_ACCOUNT',
            payload: {
              ...account,
              currentBalance: {
                ...account.currentBalance,
                localCurrency: null // this is not updated because the mock store doesn't actually save anything
              }
            }
          }, {
            type: 'UPDATE_TRANSACTIONS',
            payload: {} // this is not updated because the mock store doesn't actually save anything
          }, {
            type: 'GROUP_BY_INSTITUTION'
          }
        ])
      })
    })
  })
})
