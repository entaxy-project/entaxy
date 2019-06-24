import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as actions from '../actions'
import types from '../types'
import { initialState as accountsInitialState } from '../reducer'
import { initialState as transactionsInitialState } from '../../transactions/reducer'
import { initialState as settingsInitialState } from '../../settings/reducer'

jest.mock('uuid/v4', () => jest.fn(() => 'xyz'))
const mockStore = configureMockStore([thunk])
// Mock call to alphavantage in fetchExchangeRates
window.fetch = jest.fn().mockImplementation(() => (
  Promise.resolve(new window.Response(
    JSON.stringify({
      'Realtime Currency Exchange Rate': {
        '6. Last Refreshed': '2018-01-01',
        '5. Exchange Rate': 1
      }
    }), {
      status: 200,
      headers: { 'Content-type': 'application/json' }
    }
  ))
))

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

const account = {
  groupId: 'g1',
  name: 'Checking',
  institution: 'TD',
  openingBalance: 1000,
  currency: 'USD'
}

describe('accounts actions', () => {
  it('should load accounts', () => {
    expect(actions.loadAccounts([account])).toEqual({
      type: types.LOAD_ACCOUNTS,
      payload: [account]
    })
  })

  describe.only('calculateBalance', () => {
    it('should return account openingBalance if there are no transactions', async () => {
      const store = mockStore({
        settings: { ...settingsInitialState, currency: account.currency },
        transactions: transactionsInitialState
      })
      expect(store.getState().settings.currency).toBe(account.currency)
      expect(actions.calculateBalance(store.getState(), account)).toEqual({
        accountCurrency: account.openingBalance,
        localCurrency: account.openingBalance
      })
    })

    it('should add openingBalance and transactions created after openingBalanceDate', () => {
      const store = mockStore({
        settings: { ...settingsInitialState, currency: account.currency },
        transactions: transactionsInitialState
      })
      account.openingBalanceDate = Date.now()
      const transactions = [
        { amount: 1, createdAt: account.openingBalanceDate - 1 },
        { amount: 2, createdAt: account.openingBalanceDate },
        { amount: 3, createdAt: account.openingBalanceDate + 1 }
      ]
      expect(store.getState().settings.currency).toBe(account.currency)
      expect(actions.calculateBalance(store.getState(), account, transactions)).toEqual({
        accountCurrency: account.openingBalance + transactions[2].amount,
        localCurrency: account.openingBalance + transactions[2].amount
      })
    })

    it('should calculateBalance and convert to Local currency', () => {
      const store = mockStore({
        settings: { ...settingsInitialState, currency: 'XYZ' },
        transactions: transactionsInitialState,
        exchangeRates: { XYZ: 2 }
      })
      account.openingBalanceDate = Date.now()
      const transactions = [
        { amount: 1, createdAt: account.openingBalanceDate - 1 },
        { amount: 2, createdAt: account.openingBalanceDate },
        { amount: 3, createdAt: account.openingBalanceDate + 1 }
      ]
      expect(store.getState().settings.currency).not.toBe(account.currency)
      const balance = account.openingBalance + transactions[2].amount
      expect(actions.calculateBalance(store.getState(), account, transactions)).toEqual({
        accountCurrency: balance,
        localCurrency: balance * 2
      })
    })
  })

  describe('createAccount', () => {
    it('should createAccount and default to group 0', () => {
      const store = mockStore({
        accounts: accountsInitialState
      })
      store.dispatch(actions.createAccount({ ...account, groupId: null }))
      expect(store.getActions()).toEqual([
        {
          type: 'CREATE_ACCOUNT',
          payload: {
            ...account,
            id: 'xyz',
            groupId: '0',
            currentBalance: 1000
          }
        }, {
          type: types.GROUP_BY_INSTITUTION
        }
      ])
    })

    it('should createAccount and use the account groupId', () => {
      const store = mockStore({
        accounts: accountsInitialState
      })
      store.dispatch(actions.createAccount(account))
      expect(store.getActions()).toEqual([
        {
          type: 'CREATE_ACCOUNT',
          payload: { ...account, id: 'xyz', currentBalance: 1000 }
        }, {
          type: types.GROUP_BY_INSTITUTION
        }
      ])
    })
  })

  it('should updateAccount', () => {
    const store = mockStore({
      accounts: accountsInitialState,
      transactions: transactionsInitialState
    })

    store.dispatch(actions.updateAccount({ ...account, id: 1, openingBalance: 0 }))
    expect(store.getActions()).toEqual([
      {
        type: types.UPDATE_ACCOUNT,
        payload: {
          ...account,
          id: 1,
          openingBalance: 0,
          currentBalance: 0 // updates currentBalance
        }
      }, {
        type: types.GROUP_BY_INSTITUTION
      }
    ])
  })

  it('should updateAccountBalance', () => {
    const store = mockStore({
      accounts: accountsInitialState,
      transactions: transactionsInitialState
    })

    store.dispatch(actions.updateAccountBalance({ ...account, id: 1, openingBalance: 0 }))
    expect(store.getActions()).toEqual([
      {
        type: types.UPDATE_ACCOUNT,
        payload: {
          ...account,
          id: 1,
          openingBalance: 0,
          currentBalance: 0
        }
      }
    ])
  })


  it('should deleteAccount', () => {
    const store = mockStore({
      accounts: {
        ...accountsInitialState,
        byId: { a1: [{ ...account, id: 'a1' }] },
        byInstitution: {
          TD: {
            groups: {
              [account.groupId]: { accountIds: ['a1'] }
            }
          }
        }
      },
      transactions: { list: [{ id: 1, accountId: 'a1', amount: 1 }] },
      settings: settingsInitialState
    })
    store.dispatch(actions.deleteAccount({ ...account, id: 'a1' }))
    expect(store.getActions()).toEqual([
      {
        type: 'DELETE_TRANSACTIONS',
        payload: [1]
      }, {
        type: types.DELETE_ACCOUNT,
        payload: 'a1'
      }, {
        type: types.GROUP_BY_INSTITUTION
      }
    ])
  })

  it('should deleteAccount but skip skipAfterChange', () => {
    const store = mockStore({
      accounts: {
        ...accountsInitialState,
        byId: { a1: [{ ...account, id: 'a1' }] },
        byInstitution: {
          TD: {
            groups: {
              [account.groupId]: { accountIds: ['a1'] }
            }
          }
        }
      },
      transactions: transactionsInitialState,
      settings: settingsInitialState
    })
    store.dispatch(actions.deleteAccount({ ...account, id: 'a1' }, { skipAfterChange: true }))
    expect(store.getActions()).toEqual([
      {
        type: 'DELETE_TRANSACTIONS',
        payload: []
      }, {
        type: types.DELETE_ACCOUNT,
        payload: 'a1'
      }
    ])
  })

  it('should createAccountWithTransactions', () => {
    const transactions = [{ id: 'xyz', accountId: 'xyz', amount: 1 }]

    const store = mockStore({
      accounts: accountsInitialState
    })
    const accountId = actions.createAccountWithTransactions(store.dispatch, { ...account, groupId: null }, transactions)
    expect(accountId).toBe('xyz')
    expect(store.getActions()).toEqual([
      {
        type: types.CREATE_ACCOUNT,
        payload: {
          ...account,
          id: 'xyz',
          groupId: '0',
          currentBalance: 1000
        }
      }, {
        type: 'ADD_TRANSACTIONS',
        payload: transactions
      }
    ])
  })

  it('should createAccountGroup', () => {
    const store = mockStore({
      accounts: accountsInitialState,
      transactions: transactionsInitialState,
      settings: settingsInitialState
    })
    const institution = 'Coinbase'
    const accountGroupData = { apiKey: 'ABC' }
    const importedAccounts = [{
      sourceId: 's1',
      name: 'BTC wallet',
      openingBalance: 0,
      transactions: [{ sourceId: 's2', accountId: 'xyz', amount: 1 }]
    }]

    store.dispatch(actions.createAccountGroup(institution, accountGroupData, importedAccounts))
    expect(store.getActions()).toEqual([
      {
        type: types.CREATE_ACCOUNT,
        payload: {
          id: 'xyz',
          sourceId: 's1',
          groupId: 'xyz',
          name: 'BTC wallet',
          openingBalance: 0,
          currentBalance: 0,
          institution
        }
      }, {
        type: 'ADD_TRANSACTIONS',
        payload: [{
          ...importedAccounts[0].transactions[0],
          id: 'xyz'
        }]
      }, {
        type: types.CREATE_ACCOUNT_GROUP,
        payload: {
          institution,
          accountGroup: {
            ...accountGroupData,
            accountIds: ['xyz'],
            id: 'xyz',
            type: 'api'
          }
        }
      }, {
        type: 'GROUP_BY_INSTITUTION'
      }
    ])
  })

  it('should deleteAccountGroup', () => {
    const accountGroup = { id: 'g1', accountIds: ['a1', 'a2'] }
    const transactions = [
      { id: 't1', accountId: 'a1' },
      { id: 't2', accountId: 'a1' },
      { id: 't3', accountId: 'a2' },
      { id: 't4', accountId: 'a3' }
    ]
    const store = mockStore({
      accounts: {
        byId: {
          a1: { id: 'a1', groupId: 'g1', institution: 'Coinbase' },
          a2: { id: 'a2', groupId: 'g1', institution: 'Coinbase' },
          a3: { id: 'a3', groupId: '0', institution: 'TD' }
        },
        byInstitution: {
          Coinbase: {
            groups: { g1: accountGroup }
          },
          TD: {
            groups: { 0: { id: '0', accountIds: ['a3'] } }
          }
        }
      },
      transactions: { list: transactions }
    })

    store.dispatch(actions.deleteAccountGroup(accountGroup))
    expect(store.getActions()).toEqual([
      {
        type: 'DELETE_TRANSACTIONS',
        payload: ['t1', 't2']
      }, {
        type: types.DELETE_ACCOUNT,
        payload: 'a1'
      }, {
        type: 'DELETE_TRANSACTIONS',
        payload: ['t3']
      }, {
        type: types.DELETE_ACCOUNT,
        payload: 'a2'
      }, {
        type: types.GROUP_BY_INSTITUTION
      }
    ])
  })
})
