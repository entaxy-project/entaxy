import React from 'react'
import renderer from 'react-test-renderer'
import { SettingsFormComponent } from '../form'

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
        errors={{}}
        touched={{}}
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
        errors={{}}
        touched={{}}
        handleChange={mochHandleChange}
        setFieldValue={mochSetFieldValue}
        isSubmitting={true}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
