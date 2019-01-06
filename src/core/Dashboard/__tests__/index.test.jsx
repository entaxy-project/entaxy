import React from 'react'
import renderer from 'react-test-renderer'
import { DashboardComponent } from '../'

jest.mock('../../../common/InstitutionIcon', () => 'InstitutionIcon')

const groupedAccounts = {
  TD: { accountIds: ['1', '2'], balance: 20 },
  BMO: { accountIds: ['3'], balance: 10 }
}

const mochFormatCurrency = jest.fn().mockReturnValue(0)

describe('Dashboard', () => {
  describe('snapshot', () => {
    it('matches with no accounts', () => {
      const component = renderer.create((
        <DashboardComponent
          formatCurrency={mochFormatCurrency}
          groupedAccounts={{}}
          totalBalance={0}
          classes={{ }}
        />
      ))
      expect(component.toJSON()).toMatchSnapshot()
    })

    it('matches with a few accounts', () => {
      const component = renderer.create((
        <DashboardComponent
          formatCurrency={mochFormatCurrency}
          groupedAccounts={groupedAccounts}
          totalBalance={30}
          classes={{ }}
        />
      ))
      expect(component.toJSON()).toMatchSnapshot()
    })
  })
})
