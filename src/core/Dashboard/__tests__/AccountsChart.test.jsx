import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import AccountsChart from '../AccountsChart'
import { initialState as settingsInitialState } from '../../../store/settings/reducer'

const renderContent = (props) => {
  const mockStore = configureMockStore()
  const store = mockStore({ settings: settingsInitialState })
  return {
    ...render(
      <Provider store={store}>
        <AccountsChart {...props} />
      </Provider>
    ),
    props
  }
}


describe('AccountsChart', () => {
  it('renders correctly with no data', async () => {
    renderContent({ filter: 'Assets', data: [] })
  })

  it('renders correctly with some data', async () => {
    renderContent({
      filter: 'Assets',
      data: [{
        name: 'Account name',
        value: 100,
        colour: '#ffffff'
      }]
    })
  })
})
