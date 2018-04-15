import _ from 'lodash'

function shift (number, precision, reverseShift) {
  if (reverseShift) {
    precision = -precision
  }
  const numArray = (`${number}`).split('e')
  return +(`${numArray[0]}e${numArray[1] ? (+numArray[1] + precision) : precision}`)
}

function round (number, precision) {
  return shift(Math.round(shift(number, precision, false)), precision, true)
}

function getMarketValue (portfolios) {
  return _.reduce(portfolios, (result, position) => result + position.marketValue, 0)
}

function getBookValue (portfolios) {
  return _.reduce(portfolios, (result, position) => result + position.bookValue, 0)
}

function getPL (portfolios) {
  return _.reduce(portfolios, (result, position) => result + position.pl, 0)
}

function prepareTableDataForSelectedPortfolios (selectedAccounts, portfolios) {
  const holdings = _.reduce(portfolios, (result, portfolio) => {
    if (selectedAccounts[portfolio.account.uuid]) {
      result = _.reduce(portfolio.normalizedPositions, (result, position) => {
        const existingPosition = _.find(result, {symbol: position.symbol})
        if (existingPosition) {
          existingPosition.bookValue += position.bookValue
          existingPosition.marketValue += position.marketValue
          existingPosition.pl += position.pl
          existingPosition.quantity += position.quantity
          existingPosition.averagePrice = existingPosition.bookValue / existingPosition.quantity
        } else {
          result.push(_.cloneDeep(position))
        }
        return result
      }, result)
    }
    return result
  }, [])

  const totalMarketValue = getMarketValue(holdings)

  _.map(holdings, (holding) => {
    holding.percentage = round(((holding.marketValue / totalMarketValue) * 100), 4)
  })

  return _.sortBy(holdings, ['symbol'])
}

function preparePieChartDataFromPortfolioTable (portfolioTable) {
  return _.map(portfolioTable, (holding) => {
    return {
      symbol: holding.symbol,
      percentage: holding.percentage
    }
  })
}

export {
  round,
  getMarketValue,
  getBookValue,
  getPL,
  prepareTableDataForSelectedPortfolios,
  preparePieChartDataFromPortfolioTable
}
