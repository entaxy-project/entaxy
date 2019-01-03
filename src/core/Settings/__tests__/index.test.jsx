import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import { SettingsComponent } from '../'

jest.mock('../form', () => 'SettingsForm')
const mochSaveSettings = jest.fn()
const mochDeleteAllData = jest.fn()

describe('Settings', () => {
  it('matches snapshot with no accounts and no selected accountId', () => {
    const component = renderer.create((
      <SettingsComponent
        history={{}}
        classes={{}}
        deleteAllData={mochDeleteAllData}
        saveSettings={mochSaveSettings}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('saves settings and shows the snackbar', async () => {
    const wrapper = shallow((
      <SettingsComponent
        history={{}}
        classes={{}}
        deleteAllData={mochDeleteAllData}
        saveSettings={mochSaveSettings}
      />
    ))
    const instance = wrapper.instance()
    expect(wrapper.state('openSnackbar')).toBe(false)
    await instance.handleSave()
    expect(mochSaveSettings).toHaveBeenCalled()
    expect(wrapper.state('openSnackbar')).toBe(true)
  })

  describe('Component methods', () => {
    it('deletes all data', async () => {
      const mochHistoryPush = jest.fn()
      const wrapper = shallow((
        <SettingsComponent
          history={{ push: mochHistoryPush }}
          classes={{}}
          deleteAllData={mochDeleteAllData}
          saveSettings={mochSaveSettings}
        />
      ))
      const instance = wrapper.instance()
      await instance.handleResetData()
      expect(mochDeleteAllData).toHaveBeenCalled()
      expect(mochHistoryPush).toHaveBeenCalledWith('/dashboard')
    })

    it('cancels and returns to dashboard', async () => {
      const mochHistoryPush = jest.fn()
      const wrapper = shallow((
        <SettingsComponent
          history={{ push: mochHistoryPush }}
          classes={{}}
          deleteAllData={mochDeleteAllData}
          saveSettings={mochSaveSettings}
        />
      ))
      const instance = wrapper.instance()
      instance.handleCancel()
      expect(mochHistoryPush).toHaveBeenCalledWith('/dashboard')
    })

    it('closes the snackbar', async () => {
      const wrapper = shallow((
        <SettingsComponent
          history={{}}
          classes={{}}
          deleteAllData={mochDeleteAllData}
          saveSettings={mochSaveSettings}
        />
      ))
      const instance = wrapper.instance()
      wrapper.setState({ openSnackbar: true })
      expect(wrapper.state('openSnackbar')).toBe(true)
      instance.handleCloseSnackbar()
      expect(wrapper.state('openSnackbar')).toBe(false)
    })
  })
})
