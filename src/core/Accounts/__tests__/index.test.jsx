import React from 'react'
import renderer from 'react-test-renderer'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from '../../../store'
import { AccountsComponent } from '../'

jest.mock('../../../common/InstitutionIcon', () => 'InstitutionIcon')

describe('Accounts index (Left Nav)', () => {
  it('matches snapshot with no accounts and no selected accountId', () => {
    const component = renderer.create((
      <Provider store={store}>
        <BrowserRouter>
          <AccountsComponent
            accountId={null}
            groupedAccounts={{}}
            classes={{ }}
          />
        </BrowserRouter>
      </Provider>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot with one account but no selected accountId', () => {
    const component = renderer.create((
      <Provider store={store}>
        <BrowserRouter>
          <AccountsComponent
            accountId={null}
            groupedAccounts={{ TD: [{ name: 'Checking', id: '1' }] }}
            classes={{ }}
          />
        </BrowserRouter>
      </Provider>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot with one account which is selected', () => {
    const component = renderer.create((
      <Provider store={store}>
        <BrowserRouter>
          <AccountsComponent
            accountId="1"
            groupedAccounts={{ TD: [{ name: 'Checking', id: '1' }] }}
            classes={{ }}
          />
        </BrowserRouter>
      </Provider>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
