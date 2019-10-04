/* eslint-disable no-plusplus */
/* eslint-disable import/no-cycle */
import Big from 'big.js'
import {
  subDays,
  startOfDay,
  startOfYesterday,
  isSaturday,
  isSunday
} from 'date-fns'
import types from './types'
import { fiatCurrencies, cryptoCurrencies } from '../../data/currencies'
import { showSnackbar } from '../user/actions'

export const loadExchangeRates = (exchangeRates) => {
  return { type: types.LOAD_EXCHANGE_RATES, payload: exchangeRates }
}

export const resetExchangeRates = () => {
  return { type: types.LOAD_EXCHANGE_RATES }
}

export const updateExchangeRates = (newExchangeRates) => {
  return { type: types.UPDATE_EXCHANGE_RATES, payload: newExchangeRates }
}

export const deleteCurrencies = (currencies) => {
  return { type: types.DELETE_CURRENCIES, payload: currencies }
}

export const convertToCurrency = (value, srcCurrency, timestamp) => (
  (_, getState) => {
    const { exchangeRates, settings } = getState()
    if (srcCurrency === settings.currency) return value
    if (!(srcCurrency in exchangeRates)) return null
    const dateAtStartOfDay = startOfDay(timestamp)
    let exchangeRate
    // Look for an exchange rate on the same day or up to 5 days earlier
    for (let daysBack = 0; daysBack < 5; daysBack++) {
      exchangeRate = exchangeRates[srcCurrency][subDays(dateAtStartOfDay, daysBack).getTime()]
      if (exchangeRate) break
    }

    return exchangeRate ? parseFloat(Big(value).div(Big(exchangeRate))) : null
  }
)

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
  if (process.env.NODE_ENV === 'development') console.log(`${baseUrl}?${params}`)
  const response = await fetch(`${baseUrl}?${params}`, { method: 'GET' })

  if (response.ok) {
    const data = await response.json()
    if (data.base !== localCurrency) {
      return {} // This happens when there is no data available
    }
    return data.rates
  }
  // console.log('fetchExchangeRates: Error:', response)
  return {}
}

export const fetchExchangeRates = (srcCurrencies, startDate, endDate) => (
  async (dispatch, getState) => {
    const dstCurrency = getState().settings.currency
    let newExchangeRates
    const currenciesToAdd = {
      fiat: srcCurrencies.filter((c) => fiatCurrencies[c] !== undefined),
      crypto: srcCurrencies.filter((c) => cryptoCurrencies[c] !== undefined)
    }
    if (currenciesToAdd.fiat.length > 0) {
      dispatch(showSnackbar({ text: `Fetching exchange rates for ${currenciesToAdd.fiat}...` }))
      newExchangeRates = await fetchFiatExchangeRates(
        currenciesToAdd.fiat,
        dstCurrency,
        subDays(startDate, 10).getTime(), // Always get the 10 previous days so we have fallback data
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
)

// Note: exchange rates are collected at EOD and closed on the weekend
// so we always look the the previous weekday
export const getLastWeekday = (startDate = startOfYesterday()) => {
  if (isSunday(startDate)) return subDays(startDate, 2).getTime()
  if (isSaturday(startDate)) return subDays(startDate, 1).getTime()
  return startDate.getTime()
}
// Collect all the currencies used in accounts and the dates of the exchange rates available
// {
//   CAD: {
//     newestExchangeRateDate: timestamp,
//     oldestExchangeRateDate: timestamp,
//     newOldest: timestamp
//   }, {
//     USD: { ...}
//   }
// }
export const getAccountCurrenciesMap = (accounts, settings, exchangeRates, { excludeAccountId } = {}) => (
  accounts.reduce((result, account) => {
    if (account.id === excludeAccountId) return result
    if (account.currency === settings.currency) return result
    if (account.currency in result) return result

    // Note: exchange rates are collected at EOD and closed on the weekend
    // so we always look the the previous weekday
    const lastWeekday = getLastWeekday()
    let params = {}
    if (account.currency in exchangeRates) {
      const {
        0: oldestExchangeRateDate,
        length: len,
        [len - 1]: newestExchangeRateDate
      } = Object.keys(exchangeRates[account.currency]).sort((a, b) => a - b)
      params = {
        oldestExchangeRateDate: Number(oldestExchangeRateDate || lastWeekday),
        newestExchangeRateDate: Number(newestExchangeRateDate || lastWeekday)
      }
    } else {
      params = {
        oldestExchangeRateDate: lastWeekday,
        newestExchangeRateDate: lastWeekday
      }
    }
    return ({
      ...result,
      [account.currency]: {
        ...result[account.currency] || [],
        ...params,
        newOldest: params.oldestExchangeRateDate,
        newNewest: lastWeekday
      }
    })
  }, {})
)

// This is called only when accounts change
export const updateCurrencies = ({ forceStarDates = {}, excludeAccountId } = {}) => async (dispatch, getState) => {
  const {
    accounts,
    transactions,
    settings
  } = getState()
  let { exchangeRates } = getState()
  const accountCurrencies = getAccountCurrenciesMap(
    Object.values(accounts.byId),
    settings,
    exchangeRates,
    { excludeAccountId }
  )

  // Delete exchange rates for unused currencies
  let usedCurrencies = Object.keys(accountCurrencies)
  const currenciesToDelete = Object.keys(exchangeRates).filter((currency) => !usedCurrencies.includes(currency))
  if (currenciesToDelete.length > 0) {
    dispatch(deleteCurrencies(currenciesToDelete))
    exchangeRates = getState().exchangeRates // reload
  }
  // Inject the forced start Dates
  const lastWeekday = getLastWeekday()
  Object.keys(forceStarDates).forEach((currency) => {
    if (currency !== settings.currency) {
      if (!(currency in accountCurrencies)) {
        accountCurrencies[currency] = {
          oldestExchangeRateDate: lastWeekday,
          newestExchangeRateDate: lastWeekday,
          newOldest: forceStarDates[currency],
          newNewest: lastWeekday
        }
      }
      if (forceStarDates[currency] < accountCurrencies[currency].newOldest) {
        accountCurrencies[currency].newOldest = forceStarDates[currency]
      }
    }
  })

  usedCurrencies = Object.keys(accountCurrencies) // reload
  // For each transaction find the oldest date for wich we don't have an exchange rate yet
  transactions.list.forEach((transaction) => {
    const accountCurrency = accounts.byId[transaction.accountId].currency
    if (
      usedCurrencies.includes(accountCurrency)
      && !transaction.amount.localCurrency
      && transaction.createdAt < accountCurrencies[accountCurrency].newOldest
    ) {
      accountCurrencies[accountCurrency].newOldest = transaction.createdAt
    }
  })

  await Promise.all(usedCurrencies.map(async (currency) => {
    if (
      !exchangeRates[currency]
      || accountCurrencies[currency].newOldest < accountCurrencies[currency].oldestExchangeRateDate
      || accountCurrencies[currency].newNewest > accountCurrencies[currency].newestExchangeRateDate
    ) {
      await dispatch(fetchExchangeRates(
        [currency],
        accountCurrencies[currency].newOldest,
        accountCurrencies[currency].newNewest
      ))
    }
    return null
  }))
}
