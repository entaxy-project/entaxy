import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { SettingsFormComponent } from '../form'
import currencies from '../../../data/currencies'
import locales from '../../../data/locales'

const mochHandleSave = jest.fn()
const mochHandleDeleteAllData = jest.fn()
const mochHandleSubmit = jest.fn()
const mochHandleChange = jest.fn()
const mochSetFieldValue = jest.fn()

describe('SettingsForm', () => {
  it('matches snapshot before submitting form', () => {
    const component = renderer.create((
      <SettingsFormComponent
        handleSave={mochHandleSave}
        handleDeleteAllData={mochHandleDeleteAllData}
        classes={{}}
        handleSubmit={mochHandleSubmit}
        values={{}}
        handleChange={mochHandleChange}
        setFieldValue={mochSetFieldValue}
        isSubmitting={false}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot before after submitting form', () => {
    const component = renderer.create((
      <SettingsFormComponent
        handleSave={mochHandleSave}
        handleDeleteAllData={mochHandleDeleteAllData}
        classes={{}}
        handleSubmit={mochHandleSubmit}
        values={{}}
        handleChange={mochHandleChange}
        setFieldValue={mochSetFieldValue}
        isSubmitting={true}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  describe('Component methods', () => {
    const wrapper = shallow((
      <SettingsFormComponent
        handleSave={mochHandleSave}
        handleDeleteAllData={mochHandleDeleteAllData}
        classes={{}}
        handleSubmit={mochHandleSubmit}
        values={{}}
        handleChange={mochHandleChange}
        setFieldValue={mochSetFieldValue}
        isSubmitting={true}
      />
    ))
    const instance = wrapper.instance()

    describe('filteredCurrencies', () => {
      it('filters with no input', async () => {
        const result = await instance.filteredCurrencies()
        expect(result).toEqual(Object.keys(currencies).map(key => ({
          value: key,
          label: `(${key}) ${currencies[key]}`
        })))
      })

      it('filters with some input', async () => {
        const result = await instance.filteredCurrencies('EU')
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
        const result = await instance.filteredCurrencies('CAD')
        expect(result).toEqual([{ label: `(CAD) ${currencies.CAD}`, value: 'CAD' }])
      })
    })

    describe('filteredLocales', () => {
      it('filters with no input', async () => {
        const result = await instance.filteredLocales()
        expect(result).toEqual(Object.keys(locales).map(key => ({
          value: key,
          label: locales[key]
        })))
      })

      it('filters with some input', async () => {
        const result = await instance.filteredLocales('Cana')
        expect(result).toEqual([
          { label: 'English (Canada)', value: 'en-CA' },
          { label: 'French (Canada)', value: 'fr-CA' },
          { label: 'Spanish (Canary Islands)', value: 'es-IC' }
        ])
      })

      it('filters with a specific input', async () => {
        const result = await instance.filteredLocales('English (Canada)')
        expect(result).toEqual([{ label: 'English (Canada)', value: 'en-CA' }])
      })
    })
  })
})
