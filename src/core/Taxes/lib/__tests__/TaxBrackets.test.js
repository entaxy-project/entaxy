import {
  TaxBrackets,
  taxBracketData,
  calculateTotalTax,
  totalMarginalTax
} from '../TaxBrackets'

describe('TaxBrackets', () => {
  it('generates tax bracket data', () => {
    const brackets = {
      federal: [
        { amountUpTo: 11635.00, tax: 0 },
        { amountUpTo: 45916.00, tax: 15.00 }
      ],
      regional: {
        Ontario: [
          { amountUpTo: 10171.00, tax: 0 },
          { amountUpTo: 42201.00, tax: 5.05 }
        ]
      }
    }


    expect(taxBracketData(brackets, 'Ontario')).toEqual([
      {
        federal: 15,
        income: 11635,
        regional: 0,
        tax: 15,
        type: 'federal'
      },
      {
        federal: 15,
        income: 11635,
        regional: 5.05,
        tax: 20.05,
        type: 'regional'
      }
    ])
  })
})
