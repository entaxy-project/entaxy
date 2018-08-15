/* eslint-disable no-console */
import _ from 'lodash'
import types from './types'

export const createMarketValue = (ticker, marketValue, updatedOn) => {
  return { type: types.CREATE_MARKET_VALUE, payload: { ticker, marketValue, updatedOn } }
}

export const updateMarketValue = (ticker, marketValue, updatedOn) => {
  return { type: types.UPDATE_MARKET_VALUE, payload: { ticker, marketValue, updatedOn } }
}

export const deleteMarketValues = (tickers) => {
  return { type: types.DELETE_MARKET_VALUES, payload: tickers }
}

export const loadMarketValues = (marketValues) => {
  return { type: types.LOAD_MARKET_VALUES, payload: marketValues }
}

const fetchMarketValues = (tickers) => {
  const baseUrl = 'https://www.alphavantage.co/query'
  const apiKey = 'ULBI9EJIG95AH1G5'
  const params = `apikey=${apiKey}&function=TIME_SERIES_DAILY`

  return (dispatch, getState) => {
    return Promise.all(_.each(tickers, (ticker) => {
      console.log('fetch', `${baseUrl}?${params}&symbol=${ticker}`)
      return fetch(`${baseUrl}?${params}&symbol=${ticker}`, { method: 'GET' })
        .then(response => response.json())
        .then((data) => {
          const dates = Object.keys(data['Time Series (Daily)']).sort()
          const updatedOn = dates[dates.length - 1]
          const marketValue = data['Time Series (Daily)'][updatedOn]['4. close']

          if (!getState()[ticker]) {
            dispatch(createMarketValue(ticker, marketValue, updatedOn))
          } else {
            dispatch(updateMarketValue(ticker, marketValue, updatedOn))
          }
        })
    }))
  }
}

export const updateMarketValues = () => {
  return (dispatch, getState) => {
    const existingTickers = Object.keys(getState().marketValues || {})
    const newTickers = _(getState().transactions).map('ticker').uniq().value()

    const tickersToRemove = _.difference(existingTickers, newTickers)
    const tickersToAdd = _.difference(newTickers, existingTickers)

    if (!_.isEmpty(tickersToRemove)) {
      dispatch(deleteMarketValues(tickersToRemove))
    }

    if (!_.isEmpty(tickersToAdd)) {
      dispatch(fetchMarketValues(tickersToAdd))
    }

    return Promise.resolve()
  }
}

