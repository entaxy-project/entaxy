/* eslint-disable import/no-cycle */
import Big from 'big.js'
// import parse from 'date-fns/parse'
import types from './types'
import { dateFormatter } from '../../util/stringFormatter'

export const loadExchangeRates = (exchangeRate) => {
  return { type: types.LOAD_EXCHANGE_RATES, payload: exchangeRate }
}

export const createExchangeRate = (currency, exchangeRate, updatedOn) => {
  return { type: types.CREATE_EXCHANGE_RATE, payload: { currency, exchangeRate, updatedOn } }
}

export const updateExchangeRate = (currency, exchangeRate, updatedOn) => {
  return { type: types.UPDATE_EXCHANGE_RATE, payload: { currency, exchangeRate, updatedOn } }
}

export const deleteCurrencies = (currencies) => {
  return { type: types.DELETE_CURRENCIES, payload: currencies }
}

export const currencyExists = currency => (_, getState) => (
  Object.keys(getState().exchangeRates).includes(currency)
)

export const convertToLocalCurrency = ({ settings, exchangeRates }, value, srcCurrency) => {
  if (srcCurrency === settings.currency) {
    return value
  }
  return parseFloat(Big(value).times(Big(exchangeRates[srcCurrency] || 1)))
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
  console.log('fetchExchangeRates', `${baseUrl}?${params}`)
  console.log('fetchExchangeRates', `${baseUrl}?${params}`)
  console.log('fetchExchangeRates', `${baseUrl}?${params}`)

  const response = await fetch(`${baseUrl}?${params}`, { method: 'GET' })
  if (response.ok) {
    const data = await response.json()
    if (data.base !== localCurrency) {
      console.log(`Error: Currency returned '${data.base}' is not the same as requested '${localCurrency}'`)
      return []
    }
    return data.rates
  }
  console.log('Error:', response)
  return []
}

export const updateCurrencies = () => {
  return async (dispatch, getState) => {
    const { exchangeRates, accounts, settings } = getState()
    const existingCurrencies = Object.keys(exchangeRates || {})
    let newCurrencies = new Set(Object.values(accounts.byId).map(account => account.currency))
    newCurrencies.delete(settings.currency)
    newCurrencies = Array.from(newCurrencies)

    const currenciesToRemove = existingCurrencies.filter(x => !newCurrencies.includes(x))
    const currenciesToAdd = newCurrencies.filter(x => !existingCurrencies.includes(x))

    if (currenciesToRemove.length > 0) {
      dispatch(deleteCurrencies(currenciesToRemove))
    }

    if (currenciesToAdd.length > 0) {
      const todaysDateString = dateFormatter(settings.locale)(new Date())
      const newExchangeRates = await fetchExchangeRates(
        currenciesToAdd,
        settings.currency,
        todaysDateString,
        todaysDateString
      )
      console.log('updateExchangeRates', newExchangeRates)
      // dispatch({ type: UPDATE_EXCHANGE_RATES, payload: newExchangeRates })
    }
  }
}
