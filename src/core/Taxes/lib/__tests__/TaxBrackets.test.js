import {
  TaxBrackets,
  hasRegion,
  taxBracketData,
  calculateTax,
  calculateTotalTax,
  incomeTaxData
} from '../TaxBrackets'

describe('TaxBrackets', () => {
  describe('hasRegion', () => {
    it('checks for tax bracket in region', () => {
      expect(hasRegion({ regional: { Ontario: [] } }, 'Ontario')).toBe(true)
      expect(hasRegion({ regional: { Ontario: [] } }, 'bogus')).toBe(false)
      expect(hasRegion({ federal: [] }, 'Ontario')).toBe(false)
    })
  })

  describe('taxBracketData', () => {
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
  })

  describe('calculateTax', () => {
    it('calculates tax for bracket', () => {
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
  })

  describe('calculateTotalTax', () => {
    it('calculates total tax for brackets with region ', () => {
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

    it('calculates total tax for brackets witout region', () => {
      const brackets = {
        federal: [
          { amountUpTo: 11635.00, tax: 0 },
          { amountUpTo: 45916.00, tax: 15.00 },
          { amountUpTo: 91831.00, tax: 20.50 }
        ]
      }
      expect(calculateTotalTax(brackets, undefined, 1000)).toEqual(0)
      expect(calculateTotalTax(brackets, undefined, 12000)).toEqual((12000 - 11635) * (15.0 / 100))
    })
  })

  describe('incomeTaxData', () => {
    it('defaults to $250,000 if income is zero', () => {
      const countryBracket = TaxBrackets.Canada[2017]
      const step = 100

      const taxData = incomeTaxData(countryBracket, 'Ontario', 0)
      const braketsCount = countryBracket.federal.length + (countryBracket.regional.Ontario.length - 1)
      expect(taxData.length).toEqual(braketsCount + (250000 / step))
      expect(taxData[0]).toEqual({ income: 0, tax: 0 })
      expect(taxData.slice(-1)).toEqual([{
        income: 250000,
        tax: calculateTotalTax(countryBracket, 'Ontario', 250000)
      }])
    })

    it('generates income array for country brackets with region', () => {
      const countryBracket = TaxBrackets.Canada[2017]

      const taxData = incomeTaxData(countryBracket, 'Ontario', 20000)
      expect(taxData[0]).toEqual({ income: 0, tax: 0 })
      expect(taxData.slice(-1)).toEqual([{
        income: 20000 + 25000,
        tax: calculateTotalTax(countryBracket, 'Ontario', 20000 + 25000)
      }])
    })

    it('generates income array for country brackets without region', () => {
      const countryBracket = TaxBrackets.Canada[2017]

      const taxData = incomeTaxData(countryBracket, null, 20000)
      expect(taxData[0]).toEqual({ income: 0, tax: 0 })
      expect(taxData.slice(-1)).toEqual([{
        income: 20000 + 25000,
        tax: calculateTotalTax(countryBracket, null, 20000 + 25000)
      }])
    })
  })
})
