import React from 'react'
import { shallow, mount } from 'enzyme'
import { MemoryRouter, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from '../../../../store'
import { createAccount } from '../../../../store/accounts/actions'
import ImportTransactions, { ImportTransactionsComponent } from '..'

jest.mock('../../../../common/InstitutionIcon/importLogos', () => [])

const account = {
  institution: 'TD',
  groupId: '0',
  description: 'Checking',
  currency: 'CAD',
  openingBalance: 10,
  currentBalance: 10
}

describe('Import Transactions', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    // Add one account to the store
    account.id = await store.dispatch(createAccount(account))
  })

  const mockSaveTransactions = jest.fn()

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

    describe('handleSave', () => {
      it('should save transactions', async () => {
        const transactions = [{
          amount: 0,
          description: 'description',
          createdAt: Date.now()
        }]
        const importedTransactions = transactions.map(t => Object.assign({}, t, { errors: [] }))
        expect(instance.setState({ transactions: importedTransactions }))
        await instance.handleSave({ name: 'new account' })
        expect(mockSaveTransactions).toHaveBeenCalledWith(account, transactions)
        expect(mochHistoryPush).toHaveBeenCalledWith(`/accounts/${account.id}/transactions`)
      })

      it('should not save if there are no transactions without errors', async () => {
        expect(instance.state.transactions).toEqual([])
        await instance.handleSave({ name: 'new account' })
        expect(mockSaveTransactions).not.toHaveBeenCalledWith(account, [])
        expect(mochHistoryPush).toHaveBeenCalledWith(`/accounts/${account.id}/transactions`)
      })
    })

    it('cancels the import', () => {
      instance.handleCancel()
      expect(mochHistoryPush).toHaveBeenCalledWith(`/accounts/${account.id}/transactions`)
    })

    it('should go back to the begining of the import', () => {
      instance.setState({ showTransactions: true })
      instance.handleBack()
      expect(instance.state.showTransactions).toBeFalsy()
    })

    it('handles the parsed data (before saving)', () => {
      expect(instance.state).toEqual({
        importType: 'CSV',
        errors: {},
        transactions: [],
        showTransactions: false
      })
      instance.handleParsedData(['transactions'], { errors: ['some errors'] })
      expect(instance.state).toEqual({
        importType: 'CSV',
        errors: { errors: ['some errors'] },
        transactions: ['transactions'],
        showTransactions: true
      })
    })
  })
})
