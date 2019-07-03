import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { SettingsComponent } from '..'

jest.mock('../form', () => 'SettingsForm')
const mochSaveSettings = jest.fn()
const mochDeleteAllData = jest.fn()
const mochShowSnackbar = jest.fn()

describe('Settings', () => {
  it('matches snapshot with no accounts and no selected accountId', () => {
    const component = renderer.create((
      <SettingsComponent
        history={{}}
        classes={{}}
        deleteAllData={mochDeleteAllData}
        saveSettings={mochSaveSettings}
        showSnackbarMessage={mochShowSnackbar}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  describe('Component methods', () => {
    const mochHistoryPush = jest.fn()
    const wrapper = shallow((
      <SettingsComponent
        history={{ push: mochHistoryPush }}
        classes={{}}
        deleteAllData={mochDeleteAllData}
        saveSettings={mochSaveSettings}
        showSnackbarMessage={mochShowSnackbar}
      />
    ))
    const instance = wrapper.instance()

    it('saves settings and shows the snackbar', async () => {
      await instance.handleSave()
      expect(mochSaveSettings).toHaveBeenCalled()
      expect(mochShowSnackbar).toHaveBeenCalledWith({ status: 'success', text: 'Your settings have been saved' })
    })

    it('deletes all data', async () => {
      await instance.handleResetData()
      expect(mochDeleteAllData).toHaveBeenCalled()
      expect(mochHistoryPush).toHaveBeenCalledWith('/dashboard')
    })

    it('cancels and returns to dashboard', async () => {
      instance.handleCancel()
      expect(mochHistoryPush).toHaveBeenCalledWith('/dashboard')
    })
  })
})
