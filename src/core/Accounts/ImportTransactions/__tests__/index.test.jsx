import React from 'react'
import renderer from 'react-test-renderer'
import { shallow, mount } from 'enzyme'
import { MemoryRouter, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from '../../../../store'
import { createAccount } from '../../../../store/accounts/actions'
import ImportTransactions, { ImportTransactionsComponent } from '../'

jest.mock('../../../../common/InstitutionIcon/importLogos', () => [])

const account = {
  description: 'Checking',
  institution: 'TD',
  currency: 'CAD',
  currenctBalance: 10
}

describe('Import Transactions', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    // Add one account to the store
    account.id = await store.dispatch(createAccount(account))
  })

  const mockSaveTransactions = jest.fn()

  it('matches snapshot', () => {
    const component = renderer.create((
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/accounts/${account.id}/import/CSV`]} initialIndex={0}>
          <Route
            component={props => <ImportTransactions {...props} />}
            path="/accounts/:accountId/import/:importType"
          />
        </MemoryRouter>
      </Provider>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('finds the right account from the url', () => {
    const wrapper = mount((
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/accounts/${account.id}/import/CSV`]} initialIndex={0}>
          <Route
            component={props => <ImportTransactions {...props} />}
            path="/accounts/:accountId/import/:importType"
          />
        </MemoryRouter>
      </Provider>
    ))
    const instance = wrapper.find('ImportTransactionsComponent').instance()
    expect(instance.props.account).toEqual(account)
  })

  describe('Component methods', () => {
    const mochHistoryPush = jest.fn()
    let wrapper
    let instance

    beforeEach(() => {
      wrapper = shallow((
        <ImportTransactionsComponent
          account={account}
          classes={{}}
          history={{ push: mochHistoryPush }}
          match={{ params: { accountId: account.id } }}
          saveTransactions={mockSaveTransactions}
        />
      ))
      instance = wrapper.instance()
    })

    it('saves the transactions', async () => {
      await instance.handleSave({ name: 'new account' })
      expect(mockSaveTransactions).toHaveBeenCalled()
      expect(mochHistoryPush).toHaveBeenCalledWith(`/accounts/${account.id}/transactions`)
    })

    it('cancels the import', () => {
      instance.handleCancel()
      expect(mochHistoryPush).toHaveBeenCalledWith(`/accounts/${account.id}/transactions`)
    })

    it('handles the parsed data (before saving)', () => {
      expect(instance.state).toEqual({
        errors: {},
        transactions: [],
        showTransactions: false
      })
      instance.handleParsedData(['transactions'], { errors: ['some errors'] })
      expect(instance.state).toEqual({
        errors: { errors: ['some errors'] },
        transactions: ['transactions'],
        showTransactions: true
      })
    })
  })
})
