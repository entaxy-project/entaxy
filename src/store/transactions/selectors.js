/* eslint no-console: 0 */
import _ from 'lodash'
import { createSelector } from 'reselect'

const getTransactions = ({ transactions }) => transactions
const getMarketValues = state => state.marketValues
const getPortfolioFilters = state => state.settings.portfolioFilters

const accountTransactions = ({ transactions }, { match }) => {
  const { list, sortBy, sortDirection } = transactions
  return list
    .filter(transaction => (
      transaction.accountId === match.params.accountId
    ))
    .sort((a, b) => (
      sortDirection === 'ASC' ? a[sortBy] > b[sortBy] : a[sortBy] < b[sortBy]
    ))
}

export const makeAccountTransactions = () => createSelector(
  accountTransactions,
  transactions => ({ transactions })
)

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
  getMarketValues,
  (transactions, marketValues) => {
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

