import locales, { formatedLocales, filteredLocales } from '../locales'

describe('currencies', () => {
  describe('formatedCurrencies', () => {
    it('formats for auto-select', () => {
      expect(formatedLocales[0]).toEqual({ label: 'Afrikaans', value: 'af' })
    })
  })

  describe('filteredLocales', () => {
    it('filters with no input', async () => {
      const result = await filteredLocales()
      expect(result).toEqual(Object.keys(locales).map(key => ({
        value: key,
        label: locales[key]
      })))
    })

    it('filters with some input', async () => {
      const result = await filteredLocales('Cana')
      expect(result).toEqual([
        { label: 'English (Canada)', value: 'en-CA' },
        { label: 'French (Canada)', value: 'fr-CA' },
        { label: 'Spanish (Canary Islands)', value: 'es-IC' }
      ])
    })

    it('filters with a specific input', async () => {
      const result = await filteredLocales('English (Canada)')
      expect(result).toEqual([{ label: 'English (Canada)', value: 'en-CA' }])
    })
  })
})
