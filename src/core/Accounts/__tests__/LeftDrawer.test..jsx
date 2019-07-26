import React from 'react'
import renderer from 'react-test-renderer'
import { BrowserRouter } from 'react-router-dom'
import { LeftDrawerComponent } from '../LeftDrawer'
import { initialState as accountsInitialState, groupByInstitution } from '../../../store/accounts/reducer'
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
      groupId: 0,
      description: 'BTC',
      institution: 'Coinbase',
      currency: 'BTC', // Different currency
      currentBalance: { accountCurrency: 0.0001, localCurrency: 10 },
      type: 'wallet'
    }
  },
  byInstitution: {
    Coinbase: {
      balance: 0,
      groups: {
        0: {
          id: 0,
          type: 'api',
          accountIds: [4]
        }
      }
    }
  }
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
          <LeftDrawerComponent
            settings={settingsInitialState}
            accounts={accountsInitialState}
            match={{ params: {} }}
            classes={{ }}
          >
            <div />
          </LeftDrawerComponent>
        </BrowserRouter>
      ))
      expect(component.toJSON()).toMatchSnapshot()
    })

    it('matches with a few accounts but none selected', () => {
      const component = renderer.create((
        <BrowserRouter>
          <LeftDrawerComponent
            settings={settingsInitialState}
            accounts={accounts}
            match={{ params: {} }}
            classes={{ }}
          >
            <div />
          </LeftDrawerComponent>
        </BrowserRouter>
      ))
      expect(component.toJSON()).toMatchSnapshot()
    })

    it('matches snapshot with a few account with one selected', () => {
      const component = renderer.create((
        <BrowserRouter>
          <LeftDrawerComponent
            settings={settingsInitialState}
            accounts={accounts}
            match={{ params: { accountId: 1 } }}
            classes={{ }}
          >
            <div />
          </LeftDrawerComponent>
        </BrowserRouter>
      ))
      expect(component.toJSON()).toMatchSnapshot()
    })
  })
})
