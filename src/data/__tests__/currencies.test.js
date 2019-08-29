import {
  fiatCurrencies,
  formatedFiatCurrencies,
  filteredFiatCurrencies
} from '../currencies'

describe('currencies', () => {
  describe('formatedFiatCurrencies', () => {
    it('formats for auto-select', () => {
      expect(formatedFiatCurrencies[0]).toEqual({ label: '(AUD) Australian Dollar', value: 'AUD' })
    })
  })

  describe('filteredFiatCurrencies', () => {
    it('filters with no input', async () => {
      const result = await filteredFiatCurrencies()
      expect(result).toEqual(Object.keys(fiatCurrencies).sort().map((key) => ({
        value: key,
        label: `(${key}) ${fiatCurrencies[key]}`
      })))
    })

    it('filters with some input', async () => {
      const result = await filteredFiatCurrencies('EU')
      expect(result).toEqual([
        { label: '(EUR) Euro', value: 'EUR' },
        { label: '(RON) Romanian Leu', value: 'RON' }
      ])
    })

    it('filters with a specific input', async () => {
      const result = await filteredFiatCurrencies('CAD')
      expect(result).toEqual([{ label: `(CAD) ${fiatCurrencies.CAD}`, value: 'CAD' }])
    })
  })
})
