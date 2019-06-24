import _ from 'lodash'
import { createSelector } from 'reselect'

const getTransactions = ({ transactions }) => transactions
const getExchangeRates = state => state.exchangeRates
const getPortfolioFilters = state => state.settings.portfolioFilters

const filteredTransactions = createSelector(
  getTransactions,
  getPortfolioFilters,
  (transactions, filters) => {
    return _.filter(transactions, (transaction) => {
      return _.reduce(filters, (result, options, filter) => {
        return result && options[transaction[filter]]
      }, true)
    })
  }
)

export const portfolioTableDataSelector = createSelector(
  filteredTransactions,
  getExchangeRates,
  (transactions, exchangeRates) => {
    const portfolioTable = _(transactions)
      .groupBy('ticker')
      .map((entries, ticker) => {
        let shares = 0
        let bookValue = 0

        // Add all the transactions for this ticker
        _.each(entries, (entry) => {
          if (entry.type === 'buy') {
            shares += entry.shares
            bookValue += entry.bookValue
          } else {
            shares -= entry.shares
            bookValue -= entry.bookValue
          }
        })

        const marketValue = exchangeRates[ticker] ? exchangeRates[ticker].marketValue : 0
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

export const portfolioTotalsSelector = createSelector(
  portfolioTableDataSelector,
  (portfolioTableData) => {
    const totals = {
      bookValue: 0,
      marketValue: 0,
      pl: 0
    }
    _.each(portfolioTableData, (entry) => {
      totals.bookValue += entry.bookValue
      totals.marketValue += entry.marketValue
      totals.pl += entry.pl
    })

    return totals
  }
)

export const portfolioPieChartSelector = createSelector(
  portfolioTableDataSelector,
  (portfolioTableData) => {
    return _.map(portfolioTableData, (entry) => {
      return {
        ticker: entry.ticker,
        percentage: entry.percentage
      }
    })
  }
)
