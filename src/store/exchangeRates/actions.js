/* eslint-disable import/no-cycle */
import Big from 'big.js'
import { subDays } from 'date-fns'
import types from './types'
import { fiatCurrencies, cryptoCurrencies } from '../../data/currencies'
import { showSnackbar } from '../settings/actions'

export const loadExchangeRates = (exchangeRate) => {
  return { type: types.LOAD_EXCHANGE_RATES, payload: exchangeRate }
}

export const updateExchangeRates = (newExchangeRates) => {
  return { type: types.UPDATE_EXCHANGE_RATES, payload: newExchangeRates }
}

export const deleteCurrencies = (currencies) => {
  return { type: types.DELETE_CURRENCIES, payload: currencies }
}

export const convertToLocalCurrency = ({ settings, exchangeRates }, value, srcCurrency) => {
  if (srcCurrency === settings.currency) {
    return value
  }
  if (exchangeRates[srcCurrency] === undefined) {
    return null
  }
  const latestExchangeRate = exchangeRates[srcCurrency][exchangeRates[srcCurrency].dates[0]]
  return parseFloat(Big(value).div(Big(latestExchangeRate)))
}

// https://api.exchangeratesapi.io/history?start_at=2018-01-01&end_at=2018-09-01
export const fetchFiatExchangeRates = async (currencies, localCurrency, startDate, endDate) => {
  const startDateString = new Intl.DateTimeFormat('en-CA').format(startDate)
  const endDateString = new Intl.DateTimeFormat('en-CA').format(endDate)
  const baseUrl = 'https://api.exchangeratesapi.io/history'
  const params = [
    `base=${localCurrency}`,
    `symbols=${currencies.join()}`,
    `start_at=${startDateString}`,
    `end_at=${endDateString}`
  ].join('&')
  const response = await fetch(`${baseUrl}?${params}`, { method: 'GET' })
  if (response.ok) {
    const data = await response.json()
    if (data.base !== localCurrency) {
      return [] // This happens when there is no data available
    }
    return data.rates
  }
  // console.log('fetchExchangeRates: Error:', response)
  return []
}

export const fetchExchangeRates = (srcCurrencies, startDate = Date.now(), endDate = Date.now()) => {
  return async (dispatch, getState) => {
    // Check for the exchange rates we already have

    const dstCurrency = getState().settings.currency
    let newExchangeRates
    const currenciesToAdd = {
      fiat: srcCurrencies.filter(c => fiatCurrencies[c] !== undefined),
      crypto: srcCurrencies.filter(c => cryptoCurrencies[c] !== undefined)
    }
    if (currenciesToAdd.fiat.length > 0) {
      dispatch(showSnackbar({ text: `Fetching exchange rates for ${currenciesToAdd.fiat}...` }))
      newExchangeRates = await fetchFiatExchangeRates(
        currenciesToAdd.fiat,
        dstCurrency,
        subDays(startDate, 10),
        endDate
      )
    }
    if (currenciesToAdd.crypto.length > 0) {
      dispatch(showSnackbar({ text: `Fetching exchange rates for ${currenciesToAdd.crypto}...` }))
      // ....
      // https://min-api.cryptocompare.com/documentation?key=Other&cat=allCoinsWithContentEndpoint
    }

    // TODO: normalize format
    if (newExchangeRates !== undefined && Object.keys(newExchangeRates).length > 0) {
      dispatch(updateExchangeRates(newExchangeRates))
    }
  }
}

// This is called only when accounts change
export const updateCurrencies = () => async (dispatch, getState) => {
  const { exchangeRates, accounts, settings } = getState()
  const existingCurrencies = Object.keys(exchangeRates || {})
  let accountCurrencies = new Set(Object.values(accounts.byId).map(account => account.currency))
  accountCurrencies.delete(settings.currency) // No need for exchange rates for the local currency
  accountCurrencies = Array.from(accountCurrencies)

  const currenciesToRemove = existingCurrencies.filter(x => !accountCurrencies.includes(x))
  const currenciesToAdd = accountCurrencies.filter(x => !existingCurrencies.includes(x))

  if (currenciesToAdd.length > 0) {
    await dispatch(fetchExchangeRates(currenciesToAdd))
  }

  if (currenciesToRemove.length > 0) {
    dispatch(deleteCurrencies(currenciesToRemove))
  }
}
