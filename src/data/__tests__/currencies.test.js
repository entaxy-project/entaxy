import currencies, { formatedCurrencies, filteredCurrencies } from '../currencies'

describe('currencies', () => {
  describe('formatedCurrencies', () => {
    it('formats for auto-select', () => {
      expect(formatedCurrencies[0]).toEqual({ label: '(AFN) Afghan Afghani', value: 'AFN' })
    })
  })

  describe('filteredCurrencies', () => {
    it('filters with no input', async () => {
      const result = await filteredCurrencies()
      expect(result).toEqual(Object.keys(currencies).map(key => ({
        value: key,
        label: `(${key}) ${currencies[key]}`
      })))
    })

    it('filters with some input', async () => {
      const result = await filteredCurrencies('EU')
      expect(result).toEqual([
        { label: '(EUR) Euro', value: 'EUR' },
        { label: '(XEU) European Currency Unit', value: 'XEU' },
        { label: '(MDL) Moldovan Leu', value: 'MDL' },
        { label: '(RON) Romanian Leu', value: 'RON' },
        { label: '(ROL) Romanian Leu (1952–2006)', value: 'ROL' },
        { label: '(CHE) WIR Euro', value: 'CHE' }
      ])
    })

    it('filters with a specific input', async () => {
      const result = await filteredCurrencies('CAD')
      expect(result).toEqual([{ label: `(CAD) ${currencies.CAD}`, value: 'CAD' }])
    })
  })
})
