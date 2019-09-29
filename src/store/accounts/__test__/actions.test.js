import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { subDays, startOfYesterday } from 'date-fns'
import * as actions from '../actions'
import types from '../types'
import {
  initialState as accountsInitialState,
  groupByInstitution
} from '../reducer'
import { initialState as transactionsInitialState } from '../../transactions/reducer'
import { initialState as settingsInitialState } from '../../settings/reducer'
import { initialState as exchangeRatesInitialState } from '../../exchangeRates/reducer'
import { convertToCurrency, getLastWeekday } from '../../exchangeRates/actions'
import {
  mockFetch,
  expectExchangeratesApiToHaveBeenCalledWith,
  generateFiatExchangeRatesResponse,
  generateExchangeRates
} from '../../../setupTests'

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
  currentBalance: { accountCurrency: 1000, localCurrency: 1000 },
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

  // ------------------------------------------- calculateBalance
  describe('calculateBalance', () => {
    it('should return account openingBalance if there are no transactions', async () => {
      const store = mockStore({
        settings: { ...settingsInitialState, currency: account.currency },
        transactions: transactionsInitialState
      })
      expect(store.getState().settings.currency).toBe(account.currency)
      expect(store.dispatch(actions.calculateBalance(account))).toEqual({
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
        { amount: { accountCurrency: 1 }, createdAt: account.openingBalanceDate - 1 },
        { amount: { accountCurrency: 2 }, createdAt: account.openingBalanceDate },
        { amount: { accountCurrency: 3 }, createdAt: account.openingBalanceDate + 1 }
      ]
      expect(store.getState().settings.currency).toBe(account.currency)
      expect(store.dispatch(actions.calculateBalance(account, transactions))).toEqual({
        accountCurrency: account.openingBalance
          + transactions[1].amount.accountCurrency
          + transactions[2].amount.accountCurrency,
        localCurrency: account.openingBalance
          + transactions[1].amount.accountCurrency
          + transactions[2].amount.accountCurrency
      })
    })

    it('should calculateBalance and convert to Local currency if exchange rate exists', () => {
      const today = new Date()
      const store = mockStore({
        settings: { ...settingsInitialState, currency: 'XYZ' },
        transactions: transactionsInitialState,
        exchangeRates: { [account.currency]: { [today]: 1.1 } }
      })
      account.openingBalanceDate = Date.now()
      const transactions = [
        { amount: { accountCurrency: 1 }, createdAt: account.openingBalanceDate - 1 },
        { amount: { accountCurrency: 2 }, createdAt: account.openingBalanceDate },
        { amount: { accountCurrency: 3 }, createdAt: account.openingBalanceDate + 1 }
      ]
      expect(store.getState().settings.currency).not.toBe(account.currency)
      const balance = account.openingBalance
        + transactions[1].amount.accountCurrency
        + transactions[2].amount.accountCurrency
      expect(store.dispatch(actions.calculateBalance(account, transactions))).toEqual({
        accountCurrency: balance,
        localCurrency: store.dispatch(convertToCurrency(balance, account.currency))
      })
    })
  })

  // ------------------------------------------- convertAccountsAndTransactionsToLocalCurrency
  describe('convertAccountsAndTransactionsToLocalCurrency', () => {
    it('should convert all accounts and transactions', () => {
      const byId = {
        1: {
          id: '1',
          currency: settingsInitialState.currency,
          currentBalance: { accountCurrency: 1, localCurrency: 1 }
        },
        2: {
          id: '1',
          currency: 'EUR',
          currentBalance: { accountCurrency: 1, localCurrency: 1 }
        }
      }
      const transactions = [
        { id: 1, accountId: 1, amount: { accountCurrency: 1, localCurrency: 1 } },
        { id: 2, accountId: 1, amount: { accountCurrency: 2, localCurrency: 2 } },
        { id: 3, accountId: 2, amount: { accountCurrency: 3, localCurrency: 3 } },
        { id: 4, accountId: 2, amount: { accountCurrency: 4, localCurrency: 4 } }
      ]
      const store = mockStore({
        settings: settingsInitialState,
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: { list: transactions },
        exchangeRates: generateExchangeRates({
          currencies: [byId[1].currency],
          startAt: subDays(startOfYesterday(), 10),
          endAt: startOfYesterday()
        })
      })

      store.dispatch(actions.convertAccountsAndTransactionsToLocalCurrency())
      expect(store.getActions()).toEqual([{
        type: types.UPDATE_ACCOUNT,
        payload: byId[1]
      }, {
        type: types.UPDATE_ACCOUNT,
        payload: { ...byId[2], currentBalance: { ...byId[2].currentBalance, localCurrency: null } }
      }, {
        type: 'UPDATE_TRANSACTIONS',
        payload: transactions.reduce((result, transaction) => ({
          ...result,
          [transaction.id]: {
            amount: { ...transaction.amount, localCurrency: null }
          }
        }), {})
      }])
    })

    it('should convert only one account and its transactions', () => {
      const byId = {
        a1: {
          id: 'a1',
          currency: settingsInitialState.currency,
          currentBalance: { accountCurrency: 1, localCurrency: 1 }
        },
        a2: {
          id: 'a2',
          currency: 'EUR',
          currentBalance: { accountCurrency: 1, localCurrency: 1 }
        }
      }
      const transactions = [
        { id: 1, accountId: 'a1', amount: { accountCurrency: 1, localCurrency: 1 } },
        { id: 2, accountId: 'a1', amount: { accountCurrency: 2, localCurrency: 2 } },
        { id: 3, accountId: 'a2', amount: { accountCurrency: 3, localCurrency: 3 } },
        { id: 4, accountId: 'a2', amount: { accountCurrency: 4, localCurrency: 4 } }
      ]
      const store = mockStore({
        settings: settingsInitialState,
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: { list: transactions },
        exchangeRates: generateExchangeRates({
          currencies: [byId.a1.currency],
          startAt: subDays(startOfYesterday(), 10),
          endAt: startOfYesterday()
        })
      })

      store.dispatch(actions.convertAccountsAndTransactionsToLocalCurrency([byId.a2]))
      expect(store.getActions()).toEqual([{
        type: types.UPDATE_ACCOUNT,
        payload: { ...byId.a2, currentBalance: { ...byId.a2.currentBalance, localCurrency: null } }
      }, {
        type: 'UPDATE_TRANSACTIONS',
        payload: {
          3: { amount: { accountCurrency: 3, localCurrency: null } },
          4: { amount: { accountCurrency: 4, localCurrency: null } }
        }
      }])
    })
  })

  // ------------------------------------------- createAccount
  describe('createAccount', () => {
    it('should createAccount and default to group 0', async () => {
      const store = mockStore({
        settings: settingsInitialState,
        accounts: accountsInitialState,
        transactions: transactionsInitialState,
        exchangeRates: exchangeRatesInitialState
      })
      const accountId = await store.dispatch(actions.createAccount({ ...account, groupId: null }))
      expect(accountId).toEqual('xyz')
      expect(store.getActions()).toEqual([{
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
      }])
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
        }
      ])
    })

    it('should createAccount and fetch exchange rates', async () => {
      const lastWeekday = getLastWeekday()
      const newAccount = {
        ...account,
        groupId: null, // the group should be filled
        currency: 'EUR', // We want exchange rates to be fetched
        openingBalanceDate: subDays(lastWeekday, 30) // How far back we fetch exchange rates
      }
      const store = mockStore({
        settings: settingsInitialState,
        accounts: accountsInitialState,
        transactions: transactionsInitialState,
        exchangeRates: exchangeRatesInitialState
      })
      const fetchMockParams = {
        base: store.getState().settings.currency,
        symbols: [newAccount.currency],
        startAt: subDays(newAccount.openingBalanceDate, 10), // Should request the 10 previous days
        endAt: lastWeekday
      }
      const fetchResponse = generateFiatExchangeRatesResponse(fetchMockParams)
      const mockSpy = mockFetch(fetchResponse)

      await store.dispatch(actions.createAccount(newAccount))
      expect(store.getActions()).toEqual([{
        type: 'SHOW_SNACKBAR',
        payload: { text: 'Fetching exchange rates for EUR...' }
      }, {
        payload: fetchResponse.rates,
        type: 'UPDATE_EXCHANGE_RATES'
      }, {
        type: types.CREATE_ACCOUNT,
        payload: {
          ...newAccount,
          id: 'xyz',
          groupId: '0',
          currentBalance: { accountCurrency: 1000, localCurrency: null }
        }
      }, {
        type: types.GROUP_BY_INSTITUTION
      }, {
        type: 'SHOW_SNACKBAR',
        payload: { text: 'Account created', status: 'success' }
      }])
      expectExchangeratesApiToHaveBeenCalledWith({ mockSpy, ...fetchMockParams })
    })
  })

  // ------------------------------------------- updateAccount
  describe('updateAccount', () => {
    it('should updateAccount openingBalance', async () => {
      const store = mockStore({
        settings: settingsInitialState,
        accounts: { ...accountsInitialState, byId: { 1: account } },
        transactions: transactionsInitialState
      })

      expect(account.currentBalance).toEqual({ accountCurrency: 1000, localCurrency: 1000 })
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

    it('should updateAccount currency', async () => {
      const byId = { a1: { ...account, id: 'a1' } }
      const transaction = { id: 1, accountId: 'a1', amount: { accountCurrency: 1 } }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: { ...transactionsInitialState, list: [transaction] },
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState
      })
      expect(account.currency).toEqual(store.getState().settings.currency)
      await store.dispatch(actions.updateAccount({ ...byId.a1, currency: 'EUR' }))
      expect(store.getActions()).toEqual([
        {
          type: types.UPDATE_ACCOUNT,
          payload: {
            ...account,
            id: 'a1',
            currency: 'EUR',
            currentBalance: { ...account.currentBalance, localCurrency: null }
          }
        }, {
          type: 'UPDATE_TRANSACTIONS',
          payload: {
            1: { amount: { ...transaction.amount, localCurrency: null } }
          }
        }, {
          type: types.GROUP_BY_INSTITUTION
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: 'Account updated', status: 'success' }
        }
      ])
    })

    it('should update description', async () => {
      const byId = { a1: { ...account, id: 'a1' } }
      const transaction = { id: 1, accountId: 'a1', amount: { accountCurrency: 1 } }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: { ...transactionsInitialState, list: [transaction] },
        settings: settingsInitialState
      })

      expect(byId.a1.description).not.toEqual('new description')
      await store.dispatch(actions.updateAccount({ ...byId.a1, descriprion: 'new description' }))
      expect(store.getActions()).toEqual([
        {
          type: types.UPDATE_ACCOUNT,
          payload: {
            ...byId.a1,
            descriprion: 'new description'
          }
        }, {
          type: types.GROUP_BY_INSTITUTION
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: 'Account updated', status: 'success' }
        }
      ])
    })

    it('should onlyUpdateBalance', async () => {
      const byId = { a1: { ...account, id: 'a1' } }
      const transaction = { id: 1, accountId: 'a1', amount: { accountCurrency: 1 } }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: { ...transactionsInitialState, list: [transaction] },
        settings: settingsInitialState
      })

      expect(byId.a1.currentBalance).toEqual({ accountCurrency: 1000, localCurrency: 1000 })
      await store.dispatch(actions.updateAccount(
        { ...byId.a1, currentBalance: { accountCurrency: 1, localCurrency: 1 } },
        { onlyUpdateBalance: true }
      ))
      expect(store.getActions()).toEqual([
        {
          type: types.UPDATE_ACCOUNT,
          payload: {
            ...byId.a1,
            currentBalance: { accountCurrency: 1000, localCurrency: 1000 } // updates currentBalance
          }
        }, {
          type: types.GROUP_BY_INSTITUTION
        }
      ])
    })
  })

  // ------------------------------------------- deleteAccount
  describe('deleteAccount', () => {
    it('should deleteAccount', async () => {
      const byId = { a1: { ...account, id: 'a1' } }
      const transaction = { id: 1, accountId: 'a1', amount: 1 }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: { list: [transaction] },
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState
      })

      await store.dispatch(actions.deleteAccount(byId.a1))
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
      const byId = { a1: { ...account, id: 'a1' } }
      const transaction = { id: 1, accountId: 'a1', amount: 1 }
      const store = mockStore({
        accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
        transactions: { list: [transaction] },
        settings: settingsInitialState
      })
      await store.dispatch(actions.deleteAccount({ ...account, id: 'a1' }, { skipAfterChange: true }))
      expect(store.getActions()).toEqual([
        {
          type: 'DELETE_TRANSACTIONS',
          payload: [transaction.id]
        }, {
          type: 'COUNT_RULE_USAGE',
          payload: [transaction]
        }, {
          type: types.DELETE_ACCOUNT,
          payload: 'a1'
        }
      ])
    })
  })

  // ------------------------------------------- createAccountGroup
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
        currentBalance: { accountCurrency: 0, localCurrency: null },
        transactions: [{
          sourceId: 's2',
          accountId: 'xyz',
          amount: { accountCurrency: 1 }
        }]
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
          type: 'UPDATE_ACCOUNT',
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
          type: 'UPDATE_TRANSACTIONS',
          payload: {} // No data because mock store doesn't save anything
        }, {
          type: 'GROUP_BY_INSTITUTION'
        }
      ])
    })
  })

  // ------------------------------------------- updateAccountGroup
  describe('updateAccountGroup', () => {
    it('should updateAccountGroup', async () => {
      const byId = {
        a1: { ...account, id: 'a1', group: 'g1' },
        a2: { ...account, id: 'a2', group: 'g1' }
      }
      const transaction = { id: 1, accountId: 'a1', amount: 1 }
      const store = mockStore({
        accounts: {
          byId,
          byInstitution: groupByInstitution({
            byId,
            byInstitution: {
              [byId.a1.institution]: {
                groups: { g1: { apiKey: 'ABC' } }
              }
            }
          })
        },
        transaction: { ...transactionsInitialState, list: [transaction] },
        settings: settingsInitialState,
        exchangeRates: exchangeRatesInitialState
      })

      await store.dispatch(actions.updateAccountGroup(
        byId.a1.institution,
        { apiKey: 'XYZ' },
        [],
        Object.values(byId)
      ))
      expect(store.getActions()).toEqual([])
    })
  })

  // ------------------------------------------- deleteAccountGroup
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
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: 'Account group deleted', status: 'success' }
        }
      ])
    })
  })
})
