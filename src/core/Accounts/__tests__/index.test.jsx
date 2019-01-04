import React from 'react'
import renderer from 'react-test-renderer'
import { BrowserRouter } from 'react-router-dom'
import { AccountsComponent } from '../'

jest.mock('../../../common/InstitutionIcon', () => 'InstitutionIcon')

const settings = { locale: 'en-CA', currency: 'CAD' }
const accounts = {
  TD: [{
    id: '1',
    description: 'Checking',
    institution: 'TD',
    currency: 'CAD'
  }, {
    id: '2',
    description: 'Savings',
    institution: 'TD',
    currency: 'CAD'
  }],
  BMO: [{
    id: '2',
    description: 'Checking',
    institution: 'BMO',
    currency: 'USD' // Different currency
  }]
}

describe('Accounts index (Left Nav)', () => {
  describe('snapshot', () => {
    it('matches with no accounts and no selected accountId', () => {
      const component = renderer.create((
        <BrowserRouter>
          <AccountsComponent
            settings={settings}
            accountId={null}
            groupedAccounts={{}}
            classes={{ }}
          />
        </BrowserRouter>
      ))
      expect(component.toJSON()).toMatchSnapshot()
    })

    it('matches with a few accounts but none selected', () => {
      const component = renderer.create((
        <BrowserRouter>
          <AccountsComponent
            settings={settings}
            accountId={null}
            groupedAccounts={accounts}
            classes={{ }}
          />
        </BrowserRouter>
      ))
      expect(component.toJSON()).toMatchSnapshot()
    })

    it('matches snapshot with a few account with one selected', () => {
      const component = renderer.create((
        <BrowserRouter>
          <AccountsComponent
            settings={settings}
            accountId={accounts.TD[0].id}
            groupedAccounts={accounts}
            classes={{ }}
          />
        </BrowserRouter>
      ))
      expect(component.toJSON()).toMatchSnapshot()
    })
  })
})
