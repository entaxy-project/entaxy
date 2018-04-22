import {
  hasRegion,
  taxBracketData,
  calculateTax,
  calculateTotalTax
} from '../TaxBrackets'

describe('TaxBrackets', () => {
  it('checks for tax bracket in region', () => {
    expect(hasRegion({ regional: { Ontario: [] } }, 'Ontario')).toBe(true)
    expect(hasRegion({ regional: { Ontario: [] } }, 'bogus')).toBe(false)
    expect(hasRegion({ federal: [] }, 'Ontario')).toBe(false)
  })

  it('generates tax bracket data for federal and regional', () => {
    const brackets = {
      federal: [
        { amountUpTo: 11635.00, tax: 0 },
        { amountUpTo: 45916.00, tax: 15.00 },
        { amountUpTo: 91831.00, tax: 20.50 }
      ],
      regional: {
        Ontario: [
          { amountUpTo: 10171.00, tax: 0 },
          { amountUpTo: 42201.00, tax: 5.05 },
          { amountUpTo: 84404.00, tax: 9.15 }
        ]
      }
    }
    expect(taxBracketData(brackets, 'Ontario')).toEqual([
      {
        federal: 0,
        regional: brackets.regional.Ontario[1].tax,
        income: brackets.regional.Ontario[0].amountUpTo,
        tax: brackets.regional.Ontario[1].tax,
        type: 'regional'
      },
      {
        federal: brackets.federal[1].tax,
        regional: brackets.regional.Ontario[1].tax,
        income: brackets.federal[0].amountUpTo,
        tax: brackets.federal[1].tax + brackets.regional.Ontario[1].tax,
        type: 'federal'
      },
      {
        federal: brackets.federal[1].tax,
        regional: brackets.regional.Ontario[2].tax,
        income: brackets.regional.Ontario[1].amountUpTo,
        tax: brackets.federal[1].tax + brackets.regional.Ontario[2].tax,
        type: 'regional'
      },
      {
        federal: brackets.federal[2].tax,
        regional: brackets.regional.Ontario[2].tax,
        income: brackets.federal[1].amountUpTo,
        tax: brackets.federal[2].tax + brackets.regional.Ontario[2].tax,
        type: 'federal'
      }
    ])
  })

  it('generates tax bracket data for federal with no region', () => {
    const brackets = {
      federal: [
        { amountUpTo: 11635.00, tax: 0 },
        { amountUpTo: 45916.00, tax: 15.00 },
        { amountUpTo: 91831.00, tax: 20.50 }
      ]
    }
    expect(taxBracketData(brackets)).toEqual([
      {
        federal: brackets.federal[1].tax,
        regional: 0,
        income: brackets.federal[0].amountUpTo,
        tax: brackets.federal[1].tax,
        type: 'federal'
      },
      {
        federal: brackets.federal[2].tax,
        regional: 0,
        income: brackets.federal[1].amountUpTo,
        tax: brackets.federal[2].tax,
        type: 'federal'
      }
    ])
  })

  it('calculates tax for list bracket', () => {
    const brackets = [
      { amountUpTo: 1000, tax: 0 },
      { amountUpTo: 2000, tax: 10 },
      { amountUpTo: 10000, tax: 50 }
    ]
    expect(calculateTax(brackets, 1000)).toEqual(0)
    expect(calculateTax(brackets, 1001)).toEqual(1 * (brackets[1].tax / 100))
    expect(calculateTax(brackets, 2001)).toEqual((1000 * (brackets[1].tax / 100)) + (1 * (brackets[2].tax / 100)))
    expect(calculateTax(brackets, 10000)).toEqual((1000 * (brackets[1].tax / 100)) + (8000 * (brackets[2].tax / 100)))
  })

  it('calculates total tax for region bracket', () => {
    const brackets = {
      federal: [
        { amountUpTo: 11635.00, tax: 0 },
        { amountUpTo: 45916.00, tax: 15.00 },
        { amountUpTo: 91831.00, tax: 20.50 }
      ],
      regional: {
        Ontario: [
          { amountUpTo: 10171.00, tax: 0 },
          { amountUpTo: 42201.00, tax: 5.05 },
          { amountUpTo: 84404.00, tax: 9.15 }
        ]
      }
    }
    expect(calculateTotalTax(brackets, 'Ontario', 1000)).toEqual(0)
    expect(calculateTotalTax(brackets, 'Ontario', 11000)).toEqual((11000 - 10171) * (5.05 / 100))
  })
})
