/* eslint-disable import/no-cycle */
import Big from 'big.js'
import types from './types'
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

// Alphavantage
// const fetchExchangeRatesFromAlphavantage = (currencies, localCurrency) => {
//   // https://free.currencyconverterapi.com/api/v6/convert?q=USD_PHP&compact=ultra&apiKey=f006cbcbef0364a536d4
//   // https://github.com/zackurben/alphavantage

//   const baseUrl = 'https://www.alphavantage.co/query'
//   const apiKey = 'ULBI9EJIG95AH1G5'
//   const params = `apikey=${apiKey}&function=CURRENCY_EXCHANGE_RATE&to_currency=${localCurrency}`

//   return (dispatch, getState) => (
//     Promise.all(currencies.map(async (currency) => {
//       const response = await fetch(`${baseUrl}?${params}&from_currency=${currency}`, { method: 'GET' })
//       if (response.ok) {
//         const data = await response.json()
//         if ('Realtime Currency Exchange Rate' in data) {
//           const updatedOn = parse(data['Realtime Currency Exchange Rate']['6. Last Refreshed']).getTime()
//           const exchangeRate = parseFloat(data['Realtime Currency Exchange Rate']['5. Exchange Rate'])
//           if (!getState()[currency]) {
//             dispatch(createExchangeRate(currency, exchangeRate, updatedOn))
//           } else {
//             dispatch(updateExchangeRate(currency, exchangeRate, updatedOn))
//           }
//         } else if ('Error Message' in data) {
//           console.log(`ERROR: Could not fetch Exchange Rate for ${currency}: ${data['Error Message']}`)
//         } else {
//           console.log('Unexpected response:', currency, data)
//         }
//       } else {
//         console.log('Error:', response)
//       }
//     }))
//   )
// }

// https://api.exchangeratesapi.io/history?start_at=2018-01-01&end_at=2018-09-01
export const fetchExchangeRates = async (currencies, localCurrency, starDateString, endDateString) => {
  const baseUrl = 'https://api.exchangeratesapi.io/history'
  const params = `base=${localCurrency}&symbols=${currencies.join()}&start_at=${starDateString}&end_at=${endDateString}`
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

// This is called only when accounts change
export const updateCurrencies = async (dispatch, { exchangeRates, accounts, settings }) => {
  const existingCurrencies = Object.keys(exchangeRates || {})
  let accountCurrencies = new Set(Object.values(accounts.byId).map(account => account.currency))
  accountCurrencies.delete(settings.currency)
  accountCurrencies = Array.from(accountCurrencies)
  const currenciesToRemove = existingCurrencies.filter(x => !accountCurrencies.includes(x))
  const currenciesToAdd = accountCurrencies.filter(x => !existingCurrencies.includes(x))

  if (currenciesToRemove.length > 0) {
    dispatch(deleteCurrencies(currenciesToRemove))
  }
  if (currenciesToAdd.length > 0) {
    // Fetch today's exchange rates for the new currencies
    dispatch(showSnackbar({ text: `Fetching exchange rates for ${currenciesToAdd}...` }))
    const today = new Date()
    const threeDaysAgo = today.setDate(today.getDate() - 3)
    const newExchangeRates = await fetchExchangeRates(
      currenciesToAdd,
      settings.currency,
      new Intl.DateTimeFormat('en-CA').format(threeDaysAgo), // 3 days ago
      new Intl.DateTimeFormat('en-CA').format(new Date()) // today
    )
    dispatch({ type: types.UPDATE_EXCHANGE_RATES, payload: newExchangeRates })
  }
}
