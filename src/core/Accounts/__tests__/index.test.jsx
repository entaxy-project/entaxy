import React from 'react'
import renderer from 'react-test-renderer'
import { BrowserRouter } from 'react-router-dom'
import { AccountsComponent } from '../'
import { initialState } from '../../../store/accounts/reducer'
import { initialState as settingsInitialState } from '../../../store/settings/reducer'

jest.mock('../../../common/InstitutionIcon', () => 'InstitutionIcon')

const accounts = {
  byId: {
    1: {
      id: '1',
      description: 'Checking',
      institution: 'TD',
      currency: 'CAD',
      currenctBalance: 10
    },
    2: {
      id: '2',
      description: 'Savings',
      institution: 'TD',
      currency: 'CAD',
      currenctBalance: 10
    },
    3: {
      id: '2',
      description: 'Checking',
      institution: 'BMO',
      currency: 'USD', // Different currency
      currenctBalance: 10
    }
  },
  byInstitution: {
    TD: { accountIds: ['1', '2'], balance: 20 },
    BMO: { accountIds: ['1', '2'], balance: 10 }
  }
}

describe('Accounts index (Left Nav)', () => {
  describe('snapshot', () => {
    it('matches with no accounts and no selected accountId', () => {
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
