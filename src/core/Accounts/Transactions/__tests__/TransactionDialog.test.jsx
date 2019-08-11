import React from 'react'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import TransactionDialog from '../TransactionDialog'
import ThemeProvider from '../../../ThemeProvider'
import { initialState as settingsInitialState } from '../../../../store/settings/reducer'
import { initialState as budgetInitialState } from '../../../../store/budget/reducer'

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

describe('ConfirmDialog', () => {
  const mockHandleCancel = jest.fn()

  it('matches snapshot', () => {
    const mockStore = configureMockStore()
    const store = mockStore({
      settings: settingsInitialState,
      budget: budgetInitialState
    })
    const wrapper = mount((
      <BrowserRouter>
        <Provider store={store}>
          <ThemeProvider>
            <TransactionDialog
              open={true}
              onCancel={mockHandleCancel}
              account={{ id: 1 }}
              transaction={{ id: 1 }}
            />
          </ThemeProvider>
        </Provider>
      </BrowserRouter>
    ))
    expect(wrapper.debug()).toMatchSnapshot()
  })
})
