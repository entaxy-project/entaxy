import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as actions from '../actions'
import types from '../types'

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

const marketValues = {
  VET: {
    marketValue: '1',
    updatedOn: '2018-11-30'
  },
  VAB: {
    marketValue: '2',
    updatedOn: '2018-11-30'
  }
}

describe('marketValues actions', () => {
  describe('loadMarketValues', () => {
    it('should load marketValues', () => {
      expect(actions.loadMarketValues(marketValues)).toEqual({
        type: types.LOAD_MARKET_VALUES,
        payload: marketValues
      })
    })
  })

  describe('createMarketValue', () => {
    it('should add new MarketValue', () => {
      expect(actions.createMarketValue('VEE', 3, '2018-01-01')).toEqual({
        type: 'CREATE_MARKET_VALUE',
        payload: {
          marketValue: 3,
          ticker: 'VEE',
          updatedOn: '2018-01-01'
        }
      })
    })
  })

  describe('updateMarketValue', () => {
    it('should update MarketValue', () => {
      expect(actions.updateMarketValue('VEE', 3, '2018-01-01')).toEqual({
        type: 'UPDATE_MARKET_VALUE',
        payload: {
          marketValue: 3,
          ticker: 'VEE',
          updatedOn: '2018-01-01'
        }
      })
    })
  })

  describe('deleteMarketValues', () => {
    it('should delete MarketValues', () => {
      const payload = ['VET', 'VAB']
      expect(actions.deleteMarketValues(payload)).toEqual({
        type: 'DELETE_MARKET_VALUES',
        payload
      })
    })
  })

  describe('updateMarketValues', () => {
    it('should remove all existing MarketValues', () => {
      const mockStore = configureMockStore([thunk])
      const store = mockStore({
        transactions: { list: [] },
        marketValues
      })
      return store.dispatch(actions.updateMarketValues())
        .then(() => {
          expect(store.getActions()).toEqual([
            {
              type: 'DELETE_MARKET_VALUES',
              payload: ['VET', 'VAB']
            }
          ])
        })
    })
  })
})
