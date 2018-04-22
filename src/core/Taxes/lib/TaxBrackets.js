const _ = require('lodash')


export const TaxBrackets = {
  Canada: {
    params: {
      regionName: 'province'
    },
    2017: {
      federal: [
        { amountUpTo: 11635.00, tax: 0 },
        { amountUpTo: 45916.00, tax: 15.00 },
        { amountUpTo: 91831.00, tax: 20.50 },
        { amountUpTo: 142353.00, tax: 26.00 },
        { amountUpTo: 202800.00, tax: 29.00 },
        { amountUpTo: 10000000, tax: 33.00 }
      ],
      regional: {
        Ontario: [
          { amountUpTo: 10171.00, tax: 0 },
          { amountUpTo: 42201.00, tax: 5.05 },
          { amountUpTo: 84404.00, tax: 9.15 },
          { amountUpTo: 150000.00, tax: 11.16 },
          { amountUpTo: 220000.00, tax: 12.16 },
          { amountUpTo: 10000000, tax: 13.16 }
        ]
      }
    }
  }
}


const hasRegion = (countryBrackets, region) => {
  return 'regional' in countryBrackets && region in countryBrackets.regional
}

/**
 * Expects a tax brackets object with the format below (regional is optional)
 * @param {Object} countryBrackets - The tax brackets for a country in a year
 *  federal: [
 *     { amountUpTo: 11635.00, tax: 0 },
 *     { amountUpTo: 45916.00, tax: 15.00 },
 *     ...
 *   ],
 *   regional: {
 *     'Ontario': [
 *       { amountUpTo: 10171.00, tax: 0 },
 *       { amountUpTo: 42201.00, tax: 5.05 },
 *       ...
 *     ]
 *   }
 * @param {string} region (optional) - The region from where to calculate income tax
 * @returns {Array} - The combined brackets and total payable tax rate on each bracket
 *   [
 *     {"federal": 15, "income": 11635, "regional": 0, "tax": 15, "type": "federal"},
 *     {"federal": 15, "income": 11635, "regional": 5.05, "tax": 20.05, "type": "regional"},
 *     ...
 *   ]
 */
export const taxBracketData = (countryBrackets, region) => {
  const data = []

  // Collect federal tax brackets
  for (let bracket = 0; bracket < countryBrackets.federal.length - 1; bracket += 1) {
    data.push({
      type: 'federal',
      income: countryBrackets.federal[bracket].amountUpTo,
      tax: countryBrackets.federal[bracket + 1].tax
    })
  }

  // Collect regional tax brackets (if they exist)
  if (hasRegion(countryBrackets, region)) {
    for (let bracket = 0; bracket < countryBrackets.regional[region].length - 1; bracket += 1) {
      data.push({
        type: 'regional',
        income: countryBrackets.regional[region][bracket].amountUpTo,
        tax: countryBrackets.regional[region][bracket + 1].tax
      })
    }
  }

  // Sort by income
  data.sort((a, b) => a.income - b.income)

  // Merge into one single bracket array
  let regional = 0
  let federal = 0
  _.forEach(data, (item) => {
    switch (item.type) {
      case 'regional':
        regional = item.tax
        break
      case 'federal':
        federal = item.tax
        break
      default:
    }
    Object.assign(item, { tax: federal + regional, federal, regional })
  })

  return data
}

export const calculateTax = (regionBracket, income) => {
  let tax = 0

  for (let bracket = 0; bracket < regionBracket.length; bracket += 1) {
    if (regionBracket[bracket].tax === 0) {
      if (income < regionBracket[bracket].amountUpTo) {
        break
      }
    } else {
      const prevBracketAmount = regionBracket[bracket - 1].amountUpTo
      if (regionBracket[bracket].amountUpTo === null) {
        // Pay the higher tax for the rest of the incomde
        tax += (income - prevBracketAmount) * (regionBracket[bracket].tax / 100)
      } else if (income > regionBracket[bracket].amountUpTo) {
        // Pay the full amount for this bracket
        tax += (regionBracket[bracket].amountUpTo - prevBracketAmount) * (regionBracket[bracket].tax / 100)
      } else {
        // Pay only the difference
        tax += (income - prevBracketAmount) * (regionBracket[bracket].tax / 100)
        break
      }
    }
  }
  return tax
}

export const calculateTotalTax = (country, year, region, income) => {
  let total = calculateTax(TaxBrackets[country][year].federal, income)

  if (hasRegion(TaxBrackets[country][year], region)) {
    total += calculateTax(TaxBrackets[country][year].regional[region], income)
  }
  return total
}

// Return an array with income and corresponding tax
export const IncomeTaxData = (country, year, region, income) => {
  const numericalIncome = parseFloat(income)
  const max = numericalIncome > 0 ? numericalIncome + 25000 : 250000
  const step = 100

  const data = []
  let bracket = 0
  for (let currIncome = 0; currIncome < max; currIncome += step) {
    // Add the exact bracket ammount for federal tax
    if (currIncome >= TaxBrackets[country][year].federal[bracket].amountUpTo) {
      data.push({
        income: TaxBrackets[country][year].federal[bracket].amountUpTo,
        tax: calculateTotalTax(country, year, region, TaxBrackets[country][year].federal[bracket].amountUpTo)
      })
      bracket += 1
    }
    // Add the exact bracket ammount for regional tax (if it exists)
    if (hasRegion(TaxBrackets[country][year], region)) {
      if (currIncome >= TaxBrackets[country][year].regional[region][bracket].amountUpTo) {
        data.push({
          income: TaxBrackets[country][year].regional[region][bracket].amountUpTo,
          tax: calculateTotalTax(country, year, region, TaxBrackets[country][year].regional[region][bracket].amountUpTo)
        })
        bracket += 1
      }
    }

    data.push({
      income: currIncome,
      tax: calculateTotalTax(country, year, region, currIncome)
    })
  }
  return data
}

// The marginal tax rate is the amount of tax paid
// on any additional dollar made, up to the next tax bracket.
export const marginalTax = (regionBracket, income) => {
  for (let bracket = 0; bracket < regionBracket.length; bracket += 1) {
    if (income < regionBracket[bracket].amountUpTo) {
      return regionBracket[bracket].tax / 100
    }
  }
  return 0
}

export const totalMarginalTax = (country, year, region, income) => {
  let total = marginalTax(TaxBrackets[country][year].federal, income)

  if (hasRegion(TaxBrackets[country][year], region)) {
    total += marginalTax(TaxBrackets[country][year].regional[region], income)
  }
  return total
}
