/* eslint-disable no-plusplus */
/* eslint-disable import/prefer-default-export */
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import {
  subDays,
  isWeekend,
  differenceInDays,
  startOfDay
} from 'date-fns'

configure({ adapter: new Adapter() })

// Generate a list of exchange rates but skip the weekend
// Use as initial state for the store
export const generateExchangeRates = ({ currencies, startAt, endAt }) => {
  const exchangeRates = currencies.reduce((res, currency) => ({ ...res, [currency]: {} }), {})
  const days = differenceInDays(endAt, startAt)
  for (let daysBack = 0; daysBack < days; daysBack++) {
    const date = subDays(endAt, daysBack).getTime()
    if (!isWeekend(date)) {
      currencies.forEach((currency) => {
        exchangeRates[currency][date] = (daysBack + 1) / 10
      })
    }
  }
  return exchangeRates
}

export const generateFiatExchangeRatesResponse = ({
  base,
  symbols,
  startAt,
  endAt
}) => {
  const response = { base, rates: {} }
  const days = differenceInDays(endAt, startAt)
  const beginningOfStartDay = startOfDay(startAt)
  for (let daysBack = 0; daysBack < days; daysBack++) {
    const date = subDays(beginningOfStartDay, daysBack).getTime()
    // Skip the weekend - markets are close
    if (!isWeekend(date)) {
      response.rates[date] = symbols.map((symbol) => ({ [symbol]: (daysBack + 1) / 10 }))
    }
  }
  return response
}

export const mockFetch = (response = '', status = 200) => {
  const mock = jest.fn().mockImplementationOnce(() => (
    Promise.resolve(new window.Response(
      JSON.stringify(response), {
        status,
        headers: { 'Content-type': 'application/json' }
      }
    ))
  ))
  window.fetch = mock
  return mock
}

export const expectExchangeratesApiToHaveBeenCalledWith = ({
  mockSpy,
  base,
  symbols,
  startAt,
  endAt
}) => {
  const url = 'https://api.exchangeratesapi.io/history'
  const params = [
    `base=${base}`,
    `symbols=${symbols}`,
    `start_at=${new Intl.DateTimeFormat('en-CA').format(startAt)}`,
    `end_at=${new Intl.DateTimeFormat('en-CA').format(endAt)}`
  ].join('&')
  expect(mockSpy).toHaveBeenCalledWith(`${url}?${params}`, { method: 'GET' })
}
