import React from 'react'
import renderer from 'react-test-renderer'
import { BrowserRouter } from 'react-router-dom'
import { AccountsComponent } from '..'
import { initialState, groupByInstitution } from '../../../store/accounts/reducer'
import { initialState as settingsInitialState } from '../../../store/settings/reducer'

jest.mock('../../../common/InstitutionIcon', () => 'InstitutionIcon')

const accounts = {
  byId: {
    1: {
      id: '1',
      groupId: 0,
      description: 'Checking',
      institution: 'TD',
      currency: 'CAD',
      currentBalance: { accountCurrency: 1000, localCurrency: 1000 }
    },
    2: {
      id: '2',
      groupId: 0,
      description: 'Savings',
      institution: 'TD',
      currency: 'CAD',
      currentBalance: { accountCurrency: 2000, localCurrency: 2000 }
    },
    3: {
      id: '3',
      groupId: 0,
      description: 'Checking',
      institution: 'BMO',
      currency: 'USD', // Different currency
      currentBalance: { accountCurrency: 3000, localCurrency: 3000 }
    },
    4: {
      id: '4',
      groupId: 'yzv',
      description: 'BTC wallet',
      institution: 'Coinbase',
      currency: 'BTC',
      currentBalance: { accountCurrency: 4000, localCurrency: 4000 },
      type: 'wallet',
      symbol: 'BTC'
    }
  },
  byInstitution: {}
}
accounts.byInstitution = groupByInstitution(accounts)

// Make sure we start with a specific currency
settingsInitialState.currency = 'XYZ'
settingsInitialState.locale = 'en-US'

describe('Accounts index (Left Nav)', () => {
  describe('snapshot', () => {
    it('matches with no accounts', () => {
      const component = renderer.create((
        <BrowserRouter>
          <AccountsComponent
            settings={settingsInitialState}
            accountId={null}
            accounts={initialState}
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
            settings={settingsInitialState}
            accountId={null}
            accounts={accounts}
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
            settings={settingsInitialState}
            accountId="1"
            accounts={accounts}
            classes={{ }}
          />
        </BrowserRouter>
      ))
      expect(component.toJSON()).toMatchSnapshot()
    })
  })
})
