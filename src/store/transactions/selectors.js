/* eslint-disable import/prefer-default-export */
/* eslint-disable no-console */
import _ from 'lodash'
import { createSelector } from 'reselect'

const getTransactions = state => state.transactions
const getMarketValues = state => state.marketValues

export const portfolioTableSelector = createSelector(
  getTransactions,
  getMarketValues,
  (transactions, marketValues) => {
    const portfolioTable = _(transactions)
      .groupBy('ticker')
      .map((entries, ticker) => {
        let shares = 0
        let bookValue = 0

        // Add all the transactions for this ticker
        _.each(entries, (entry) => {
          if (entry.type === 'Buy') {
            shares += entry.shares
            bookValue += entry.bookValue
          } else {
            shares -= entry.shares
            bookValue -= entry.bookValue
          }
        })

        const marketValue = marketValues[ticker] ? marketValues[ticker].marketValue : 0
        return {
          ticker,
          shares,
          bookValue,
          marketValue: marketValue * shares,
          pl: (marketValue * shares) - bookValue
        }
      })
      .value()
    const totalMarketValue = portfolioTable.reduce((acc, entry) => acc + entry.marketValue, 0)
    return portfolioTable.map((entry) => {
      return { ...entry, percentage: Math.round((entry.marketValue * 100) / totalMarketValue) }
    })
  }
)

export const portfolioPieChartSelector = createSelector(
  portfolioTableSelector,
  (portfolioTable) => {
    return _.map(portfolioTable, (entry) => {
      return {
        ticker: entry.ticker,
        percentage: entry.percentage
      }
    })
  }
)
