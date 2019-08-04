import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as actions from '../actions'
import types from '../types'
import { initialState as accountsInitialState } from '../reducer'
import { initialState as transactionsInitialState } from '../../transactions/reducer'
import { initialState as settingsInitialState } from '../../settings/reducer'
import { initialState as exchangeRatesInitialState } from '../../exchangeRates/reducer'
import { convertToLocalCurrency } from '../../exchangeRates/actions'

jest.mock('uuid/v4', () => jest.fn(() => 'xyz'))
const mockStore = configureMockStore([thunk])

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
  describe('loadAccounts', () => {
    it('should load accounts', () => {
      expect(actions.loadAccounts([account])).toEqual({
        type: types.LOAD_ACCOUNTS,
        payload: [account]
      })
    })
  })

  describe('calculateBalance', () => {
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
        accountCurrency: account.openingBalance + transactions[1].amount + transactions[2].amount,
        localCurrency: account.openingBalance + transactions[1].amount + transactions[2].amount
      })
    })

    it('should calculateBalance and convert to Local currency if exchange rate exists', () => {
      const today = new Date()
      const store = mockStore({
        settings: { ...settingsInitialState, currency: 'XYZ' },
        transactions: transactionsInitialState,
        exchangeRates: {
          [account.currency]: {
            [today]: 1.1,
            dates: [today]
          }
        }
      })
      account.openingBalanceDate = Date.now()
      const transactions = [
        { amount: 1, createdAt: account.openingBalanceDate - 1 },
        { amount: 2, createdAt: account.openingBalanceDate },
        { amount: 3, createdAt: account.openingBalanceDate + 1 }
      ]
      expect(store.getState().settings.currency).not.toBe(account.currency)
      const balance = account.openingBalance + transactions[1].amount + transactions[2].amount
      expect(actions.calculateBalance(store.getState(), account, transactions)).toEqual({
        accountCurrency: balance,
        localCurrency: convertToLocalCurrency(store.getState(), balance, account.currency)
      })
    })
  })

  describe('createAccount', () => {
    it('should createAccount and default to group 0', async () => {
      const store = mockStore({
        settings: settingsInitialState,
        accounts: accountsInitialState
      })
      const accountId = await store.dispatch(actions.createAccount({ ...account, groupId: null }))
      expect(accountId).toEqual('xyz')
      expect(store.getActions()).toEqual([
        {
          type: types.CREATE_ACCOUNT,
          payload: {
            ...account,
            id: 'xyz',
            groupId: '0',
            currentBalance: { accountCurrency: 1000, localCurrency: 1000 }
          }
        }, {
          type: types.GROUP_BY_INSTITUTION
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: 'Account created', status: 'success' }
        }
      ])
    })

    it('should createAccount and use the account groupId', async () => {
      const store = mockStore({
        settings: settingsInitialState,
        accounts: accountsInitialState
      })
      await store.dispatch(actions.createAccount(account))
      expect(store.getActions()).toEqual([
        {
          type: types.CREATE_ACCOUNT,
          payload: { ...account, id: 'xyz', currentBalance: { accountCurrency: 1000, localCurrency: 1000 } }
        }, {
          type: types.GROUP_BY_INSTITUTION
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: 'Account created', status: 'success' }
        }
      ])
    })

    it('should createAccount with transactions', async () => {
      const transactions = [{ description: 'xyz', amount: 1 }]
      const store = mockStore({
        settings: settingsInitialState,
        accounts: accountsInitialState,
        transactions: transactionsInitialState
      })
      await store.dispatch(actions.createAccount({ ...account, groupId: null }, transactions))
      expect(store.getActions()).toEqual([
        {
          type: types.CREATE_ACCOUNT,
          payload: {
            ...account,
            id: 'xyz',
            groupId: '0',
            currentBalance: { accountCurrency: 1000, localCurrency: 1000 }
          }
        }, {
          type: 'ADD_TRANSACTIONS',
          payload: transactions
        }, {
          type: 'COUNT_RULE_USAGE',
          payload: []
        }, {
          type: types.GROUP_BY_INSTITUTION
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: 'Account created', status: 'success' }
        }
      ])
    })
  })

  describe('updateAccount', () => {
    it('should updateAccount', async () => {
      const store = mockStore({
        settings: settingsInitialState,
        accounts: { ...accountsInitialState, byId: { 1: account } },
        transactions: transactionsInitialState
      })

      expect(account.currentBalance).toBe(undefined)
      await store.dispatch(actions.updateAccount({ ...account, id: 1, openingBalance: 0 }))
      expect(store.getActions()).toEqual([
        {
          type: types.UPDATE_ACCOUNT,
          payload: {
            ...account,
            id: 1,
            openingBalance: 0,
            currentBalance: { accountCurrency: 0, localCurrency: 0 } // updates currentBalance
          }
        }, {
          type: types.GROUP_BY_INSTITUTION
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: 'Account updated', status: 'success' }
        }
      ])
    })
  })

  describe('deleteAccount', () => {
    it('should deleteAccount', async () => {
      const transaction = { id: 1, accountId: 'a1', amount: 1 }
      const store = mockStore({
        accounts: {
          ...accountsInitialState,
          byId: { a1: { ...account, id: 'a1' } },
          byInstitution: {
            TD: {
              groups: {
                [account.groupId]: { accountIds: ['a1'] }
              }
            }
          }
        },
        transactions: { list: [transaction] },
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState
      })
      await store.dispatch(actions.deleteAccount({ ...account, id: 'a1' }))
      expect(store.getActions()).toEqual([
        {
          type: 'DELETE_TRANSACTIONS',
          payload: [1]
        }, {
          type: 'COUNT_RULE_USAGE',
          payload: [transaction]
        }, {
          type: types.DELETE_ACCOUNT,
          payload: 'a1'
        }, {
          type: types.GROUP_BY_INSTITUTION
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: 'Account deleted', status: 'success' }
        }
      ])
    })

    it('should deleteAccount but skip skipAfterChange', async () => {
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
      await store.dispatch(actions.deleteAccount({ ...account, id: 'a1' }, { skipAfterChange: true }))
      expect(store.getActions()).toEqual([
        {
          type: 'DELETE_TRANSACTIONS',
          payload: []
        }, {
          type: 'COUNT_RULE_USAGE',
          payload: []
        }, {
          type: types.DELETE_ACCOUNT,
          payload: 'a1'
        }
      ])
    })
  })

  describe('createAccountGroup', () => {
    it('should createAccountGroup', async () => {
      const store = mockStore({
        accounts: accountsInitialState,
        transactions: transactionsInitialState,
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState
      })
      const institution = 'Coinbase'
      const accountGroupData = { apiKey: 'ABC' }
      const importedAccounts = [{
        sourceId: 's1',
        name: 'BTC wallet',
        openingBalance: 0,
        transactions: [{ sourceId: 's2', accountId: 'xyz', amount: 1 }]
      }]

      await store.dispatch(actions.createAccountGroup(institution, accountGroupData, importedAccounts))
      expect(store.getActions()).toEqual([
        {
          type: types.CREATE_ACCOUNT,
          payload: {
            id: 'xyz',
            sourceId: 's1',
            groupId: 'xyz',
            name: 'BTC wallet',
            openingBalance: 0,
            currentBalance: { accountCurrency: 0, localCurrency: null },
            institution
          }
        }, {
          type: 'ADD_TRANSACTIONS',
          payload: [{
            ...importedAccounts[0].transactions[0],
            id: 'xyz'
          }]
        }, {
          type: 'COUNT_RULE_USAGE',
          payload: []
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
  })

  describe('deleteAccountGroup', () => {
    it('should deleteAccountGroup', async () => {
      const accountGroup = { id: 'g1', accountIds: ['a1', 'a2'] }
      const transactions = [
        { id: 't1', accountId: 'a1' },
        { id: 't2', accountId: 'a1' },
        { id: 't3', accountId: 'a2' },
        { id: 't4', accountId: 'a3' }
      ]
      const store = mockStore({
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState,
        accounts: {
          byId: {
            a1: {
              id: 'a1',
              groupId: 'g1',
              institution: 'Coinbase',
              currency: settingsInitialState.currency,
              currentBalance: { accountCurrency: 0, localCurrency: null }
            },
            a2: {
              id: 'a2',
              groupId: 'g1',
              institution: 'Coinbase',
              currency: settingsInitialState.currency,
              currentBalance: { accountCurrency: 0, localCurrency: null }
            },
            a3: {
              id: 'a3',
              groupId: '0',
              institution: 'TD',
              currency: settingsInitialState.currency,
              currentBalance: { accountCurrency: 0, localCurrency: null }
            }
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

      await store.dispatch(actions.deleteAccountGroup(accountGroup))
      expect(store.getActions()).toEqual([
        {
          type: 'DELETE_TRANSACTIONS',
          payload: ['t1', 't2']
        }, {
          type: 'COUNT_RULE_USAGE',
          payload: transactions
        }, {
          type: types.DELETE_ACCOUNT,
          payload: 'a1'
        }, {
          type: 'DELETE_TRANSACTIONS',
          payload: ['t3']
        }, {
          type: 'COUNT_RULE_USAGE',
          payload: transactions
        }, {
          type: types.DELETE_ACCOUNT,
          payload: 'a2'
        }, {
          type: types.GROUP_BY_INSTITUTION
        }
      ])
    })
  })
})
