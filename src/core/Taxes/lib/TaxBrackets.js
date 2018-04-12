export const TaxBrackets = {
  2017: {
    federal: [
      {amountUpTo: 11635.00, tax: 0},
      {amountUpTo: 45916.00, tax: 15.00},
      {amountUpTo: 91831.00, tax: 20.50},
      {amountUpTo: 142353.00, tax: 26.00},
      {amountUpTo: 202800.00, tax: 29.00},
      {amountUpTo: 10000000, tax: 33.00}
    ],
    Ontario: [
      {amountUpTo: 10171.00, tax: 0},
      {amountUpTo: 42201.00, tax: 5.05},
      {amountUpTo: 84404.00, tax: 9.15},
      {amountUpTo: 150000.00, tax: 11.16},
      {amountUpTo: 220000.00, tax: 12.16},
      {amountUpTo: 10000000, tax: 13.16}
    ]
  }
}

export const taxBracketData = (year, province) => {
  const data = []

  for (var b = 0; b < TaxBrackets[year][province].length - 1; b++) {
    data.push({
      type: 'provincial',
      income: TaxBrackets[year][province][b].amountUpTo,
      tax: TaxBrackets[year][province][b + 1].tax
    })
  }
  for (b = 0; b < TaxBrackets[year].federal.length - 1; b++) {
    data.push({
      type: 'federal',
      income: TaxBrackets[year].federal[b].amountUpTo,
      tax: TaxBrackets[year].federal[b + 1].tax
    })
  }

  data.sort((a, b) => { return a.income - b.income })

  const tax = {provincial: 0, federal: 0}
  for (let i = 0; i < data.length; i++) {
    switch (data[i].type) {
      case 'provincial':
        tax.provincial = data[i].tax
        break
      case 'federal':
        tax.federal = data[i].tax
        break
      default:
    }
    data[i].tax = tax.federal + tax.provincial
  }

  return data
}

export const calculateTax = (year, province, income) => {
  let tax = 0

  for (let b = 0; b < TaxBrackets[year][province].length; b++) {
    const bracket = TaxBrackets[year][province][b]

    if (bracket.tax === 0) {
      if (income < bracket.amountUpTo) {
        break
      }
    } else {
      const prevBracketAmount = TaxBrackets[year][province][b - 1].amountUpTo
      if (bracket.amountUpTo === null) {
        // Pay the higher tax for the rest of the incomde
        tax += (income - prevBracketAmount) * (bracket.tax / 100)
      } else if (income > bracket.amountUpTo) {
        // Pay the full amount for this bracket
        tax += (bracket.amountUpTo - prevBracketAmount) * (bracket.tax / 100)
      } else {
        // Pay only the difference
        tax += (income - prevBracketAmount) * (bracket.tax / 100)
        break
      }
    }
  }
  return tax
}

export const calculateTotalTax = (year, province, income) => {
  return calculateTax(year, 'federal', income) + calculateTax(year, province, income)
}

// Return an array with income and corresponding tax
export const IncomeTaxData = ({year, province, income}) => {
  const numericalIncome = parseFloat(income)
  const min = 0
  const max = numericalIncome > 0 ? numericalIncome + 25000 : 250000
  const step = 100

  const data = []
  let bracketIndex = 0
  for (let currIncome = min; currIncome < max; currIncome += step) {
    // Add the exact bracket ammount
    if (currIncome >= TaxBrackets[year][province][bracketIndex].amountUpTo) {
      data.push({
        income: TaxBrackets[year][province][bracketIndex].amountUpTo,
        tax: calculateTotalTax(year, province, TaxBrackets[year][province][bracketIndex].amountUpTo)
      })
      bracketIndex++
    }

    data.push({
      income: currIncome,
      tax: calculateTotalTax(year, province, currIncome)
    })
  }
  return data
}

// The marginal tax rate is the amount of tax paid
// on any additional dollar made, up to the next tax bracket.
export const marginalTax = (year, province, income) => {
  for (let b = 0; b < TaxBrackets[year][province].length; b++) {
    if (income < TaxBrackets[year][province][b].amountUpTo) {
      return TaxBrackets[year][province][b].tax / 100
    }
  }
  return 0
}

export const totalMarginalTax = (year, province, income) => {
  return marginalTax(year, 'federal', income) + marginalTax(year, province, income)
}
