import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { subDays, startOfYesterday } from 'date-fns'
import faker from 'faker'
import * as actions from '../../actions'
import { groupByInstitution } from '../../../accounts/reducer'
import { initialState as transactionsInitialState } from '../../reducer'
import { initialState as settingsInitialState } from '../../../settings/reducer'
import { initialState as exchangeRatesInitialState } from '../../../exchangeRates/reducer'
import { getLastWeekday } from '../../../exchangeRates/actions'
import { initialState as budgetInitialState } from '../../../budget/reducer'
import { fiatCurrencies } from '../../../../data/currencies'
import {
  mockFetch,
  expectExchangeratesApiToHaveBeenCalledWith,
  generateFiatExchangeRatesResponse
} from '../../../../setupTests'

jest.mock('uuid/v4', () => {
  let value = 0
  return () => {
    value += 1
    return value
  }
})

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

const mockStore = configureMockStore([thunk])

const account = {
  id: faker.random.uuid(),
  name: faker.finance.accountName(),
  institution: 'TD',
  openingBalance: faker.finance.amount(),
  openingBalanceDate: Date.now(),
  currentBalance: {
    accountCurrency: faker.finance.amount(),
    localCurrency: faker.finance.amount()
  },
  currency: settingsInitialState.currency
}

const transaction = {
  accountId: account.id,
  description: 'Buy groceries',
  amount: {
    accountCurrency: faker.finance.amount(),
    localCurrency: faker.finance.amount()
  },
  createdAt: Date.now()
}

const categoryId = budgetInitialState.categoryTree[0].options[0].id

const rule = {
  id: 1,
  accountId: account.id,
  attributes: { categoryId },
  filterBy: { description: { type: 'equals', value: transaction.description } }
}

/* eslint-disable object-curly-newline */
const transactions = [
  { ...transaction, id: 1 },
  { ...transaction, id: 2, description: faker.lorem.words(), categoryId, ruleId: rule.id },
  { ...transaction, id: 3, accountId: 'x' },
  { ...transaction, id: 4, accountId: 'x', description: faker.lorem.words(), categoryId }
]

const initStore = (params = {}) => {
  // eslint-disable-next-line no-param-reassign
  if (!params.account) params.account = account
  // eslint-disable-next-line no-param-reassign
  if (!params.transactions) params.transactions = transactions
  const byId = {
    [params.account.id]: (params.account),
    x: {
      id: 'x',
      currency: 'USD',
      currentBalance: {
        accountCurrency: faker.finance.amount(),
        localCurrency: faker.finance.amount()
      }
    }
  }
  return mockStore({
    accounts: { byId, byInstitution: groupByInstitution({ byId, byInstitution: {} }) },
    transactions: { ...transactionsInitialState, list: params.transactions },
    settings: settingsInitialState,
    exchangeRates: exchangeRatesInitialState,
    budget: { ...budgetInitialState, rules: { [rule.id]: rule } }
  })
}

describe('updateTransaction', () => {
  it('should update amount', async () => {
    const store = initStore()
    await store.dispatch(actions.updateTransaction(account, {
      ...transaction,
      id: 1,
      amount: { accountCurrency: 10 }
    }))
    expect(store.getActions()).toEqual([
      {
        type: 'UPDATE_TRANSACTION',
        payload: {
          ...transaction,
          id: 1,
          amount: {
            accountCurrency: 10,
            localCurrency: 10
          }
        }
      }, {
        // NOTE: UPDATE_ACCOUNT is called but account balance is not changed
        // because test library doesn't actually update the store
        payload: account,
        type: 'UPDATE_ACCOUNT'
      }, {
        type: 'GROUP_BY_INSTITUTION'
      }, {
        type: 'SHOW_SNACKBAR',
        payload: { text: 'Transaction updated', status: 'success' }
      }
    ])
  })

  it('should update createdAt and fetch new exchange rates', async () => {
    const newAccount = { ...account, currency: Object.keys(fiatCurrencies)[0] }
    const newTransaction = {
      ...transaction,
      id: 1,
      createdAt: subDays(startOfYesterday(), 100).getTime()
    }
    const store = initStore({ account: newAccount })
    const fetchMockParams = {
      base: store.getState().settings.currency,
      symbols: [newAccount.currency],
      startAt: subDays(newTransaction.createdAt, 10), // Should request the 10 previous days
      endAt: getLastWeekday()
    }
    const fetchResponse = generateFiatExchangeRatesResponse(fetchMockParams)
    const mockSpy = mockFetch(fetchResponse)

    await store.dispatch(actions.updateTransaction(newAccount, newTransaction))
    expect(store.getActions()).toEqual([
      {
        payload: { text: `Fetching exchange rates for ${newAccount.currency}...` },
        type: 'SHOW_SNACKBAR'
      }, {
        payload: fetchResponse.rates,
        type: 'UPDATE_EXCHANGE_RATES'
      }, {
        // NOTE: UPDATE_EXCHANGE_RATES is called but the mock store doesn't actually save anything
        type: 'UPDATE_TRANSACTION',
        payload: {
          ...newTransaction,
          id: 1,
          createdAt: newTransaction.createdAt + 1000,
          amount: {
            ...newTransaction.amount,
            localCurrency: null
          }
        }
      }, {
        // NOTE: UPDATE_ACCOUNT is called but the mock store doesn't actually save anything
        payload: newAccount,
        type: 'UPDATE_ACCOUNT'
      }, {
        type: 'GROUP_BY_INSTITUTION'
      }, {
        type: 'SHOW_SNACKBAR',
        payload: { text: 'Transaction updated', status: 'success' }
      }
    ])
    expectExchangeratesApiToHaveBeenCalledWith({ mockSpy, ...fetchMockParams })
  })

  describe('rules', () => {
    it('no rule should do nothing', async () => {
      const store = initStore()
      await store.dispatch(actions.updateTransaction(
        account,
        { ...transaction, id: 1, categoryId }
      ))
      expect(store.getActions()).toEqual([
        {
          type: 'UPDATE_TRANSACTION',
          payload: {
            ...transaction,
            id: 1,
            categoryId
          }
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: 'Transaction updated', status: 'success' }
        }
      ])
    })

    it('rule but no attributes should do nothing', async () => {
      const store = initStore()
      await store.dispatch(actions.updateTransaction(
        account,
        { ...transaction, id: 1, categoryId },
        { rule: {} }
      ))
      expect(store.getActions()).toEqual([
        {
          type: 'UPDATE_TRANSACTION',
          payload: {
            ...transaction,
            id: 1,
            categoryId
          }
        }, {
          type: 'SHOW_SNACKBAR',
          payload: { text: 'Transaction updated', status: 'success' }
        }
      ])
    })

    describe('with no existing rule add a category', () => {
      let store
      let lastId
      const newCategoryId = budgetInitialState.categoryTree[0].options[1].id
      const newRule = {
        ...rule,
        id: null,
        attributes: { categoryId: newCategoryId }
      }
      beforeEach(() => {
        store = initStore()
        lastId = Object.keys(budgetInitialState.categoriesById).length
        expect(transactions[0].categoryId).toBeUndefined()
        expect(transactions[0].ruleId).toBeUndefined()
      })

      it('not applying to existing or future should do nothing', async () => {
        await store.dispatch(actions.updateTransaction(
          account,
          { ...transactions[0], categoryId: newCategoryId },
          { rule: newRule, applyToExisting: false, applyToFuture: false }
        ))
        expect(store.getActions()).toEqual([
          {
            type: 'UPDATE_TRANSACTION',
            payload: { ...transactions[0], categoryId: newCategoryId }
          }, {
            type: 'SHOW_SNACKBAR',
            payload: { text: 'Transaction updated', status: 'success' }
          }
        ])
      })

      it('applying to existing and future should create rule', async () => {
        await store.dispatch(actions.updateTransaction(
          account,
          { ...transactions[0], categoryId: newCategoryId },
          { rule: newRule, applyToExisting: true, applyToFuture: true }
        ))
        expect(store.getActions()).toEqual([
          {
            type: 'UPDATE_TRANSACTION',
            payload: { ...transactions[0], categoryId: newCategoryId }
          }, {
            type: 'CREATE_RULE',
            payload: { ...newRule, id: lastId + 1 }
          }, { // NOTE: the rule was not actually saved so it won't show up here
            type: 'UPDATE_TRANSACTIONS',
            payload: {
              [transactions[0].id]: { ...transactions[0], categoryId: newCategoryId, ruleId: lastId + 1 }
            }
          }, {
            type: 'SHOW_SNACKBAR',
            payload: { text: 'Transaction updated', status: 'success' }
          }
        ])
      })

      it('applying to existing but not future should only update existing transactions', async () => {
        await store.dispatch(actions.updateTransaction(
          account,
          { ...transactions[0], categoryId: newCategoryId },
          { rule: newRule, applyToExisting: true, applyToFuture: false }
        ))
        expect(store.getActions()).toEqual([
          {
            type: 'UPDATE_TRANSACTION',
            payload: { ...transactions[0], categoryId: newCategoryId }
          }, {
            type: 'UPDATE_TRANSACTIONS',
            payload: {
              [transactions[0].id]: {
                ...transactions[0],
                categoryId: newCategoryId
              }
            }
          }, {
            type: 'SHOW_SNACKBAR',
            payload: { text: 'Transaction updated', status: 'success' }
          }
        ])
      })

      it('applying to future but not existing should create rule and not update existing transactions', async () => {
        await store.dispatch(actions.updateTransaction(
          account,
          { ...transactions[0], categoryId: newCategoryId },
          { rule: newRule, applyToExisting: false, applyToFuture: true }
        ))
        expect(store.getActions()).toEqual([
          {
            type: 'UPDATE_TRANSACTION',
            payload: { ...transactions[0], categoryId: newCategoryId }
          }, {
            type: 'CREATE_RULE',
            payload: { ...newRule, id: lastId + 2 }
          }, {
            type: 'SHOW_SNACKBAR',
            payload: { text: 'Transaction updated', status: 'success' }
          }
        ])
      })
    })

    describe('with no existing rule don\'t add a category', () => {
      let store
      const newRule = { ...rule, id: null, attributes: { } }
      beforeEach(() => {
        store = initStore()
        expect(transactions[0].categoryId).toBeUndefined()
        expect(transactions[0].ruleId).toBeUndefined()
      })

      it('not applying to existing or future should do nothing', async () => {
        await store.dispatch(actions.updateTransaction(
          account,
          { ...transactions[0], categoryId: null },
          { rule: newRule, applyToExisting: false, applyToFuture: false }
        ))
        expect(store.getActions()).toEqual([
          {
            type: 'UPDATE_TRANSACTION',
            payload: { ...transactions[0], categoryId: null }
          }, {
            type: 'SHOW_SNACKBAR',
            payload: { text: 'Transaction updated', status: 'success' }
          }
        ])
      })

      it('applying to existing and future should create rule', async () => {
        await store.dispatch(actions.updateTransaction(
          account,
          { ...transactions[0], categoryId: null },
          { rule: newRule, applyToExisting: true, applyToFuture: true }
        ))
        expect(store.getActions()).toEqual([
          {
            type: 'UPDATE_TRANSACTION',
            payload: { ...transactions[0], categoryId: null }
          }, { // NOTE: the rule was not actually saved so it won't show up here
            type: 'UPDATE_TRANSACTIONS',
            payload: { [transactions[0].id]: { ...transactions[0] } }
          }, {
            type: 'SHOW_SNACKBAR',
            payload: { text: 'Transaction updated', status: 'success' }
          }
        ])
      })

      it('applying to existing but not future should only update existing transactions', async () => {
        await store.dispatch(actions.updateTransaction(
          account,
          { ...transactions[0], categoryId: null },
          { rule: newRule, applyToExisting: true, applyToFuture: false }
        ))
        expect(store.getActions()).toEqual([
          {
            type: 'UPDATE_TRANSACTION',
            payload: { ...transactions[0], categoryId: null }
          }, {
            type: 'UPDATE_TRANSACTIONS',
            payload: { [transactions[0].id]: { ...transactions[0] } }
          }, {
            type: 'SHOW_SNACKBAR',
            payload: { text: 'Transaction updated', status: 'success' }
          }
        ])
      })

      it('applying to future but not existing should do nothing', async () => {
        await store.dispatch(actions.updateTransaction(
          account,
          { ...transactions[0], categoryId: null },
          { rule: newRule, applyToExisting: false, applyToFuture: true }
        ))
        expect(store.getActions()).toEqual([
          {
            type: 'UPDATE_TRANSACTION',
            payload: { ...transactions[0], categoryId: null }
          }, {
            type: 'SHOW_SNACKBAR',
            payload: { text: 'Transaction updated', status: 'success' }
          }
        ])
      })
    })

    describe('with existing rule update category', () => {
      let store
      const newCategoryId = budgetInitialState.categoryTree[0].options[1].id
      const newRule = {
        ...rule,
        id: null,
        attributes: { categoryId: newCategoryId },
        filterBy: { description: { type: 'equals', value: transactions[1].description } }
      }
      beforeEach(() => {
        store = initStore()
        expect(transactions[1].categoryId).toBeDefined()
        expect(transactions[1].categoryId).not.toEqual(newCategoryId)
        expect(transactions[1].ruleId).toBeDefined()
      })

      it('not applying to existing or future should do nothing', async () => {
        await store.dispatch(actions.updateTransaction(
          account,
          { ...transactions[1], categoryId: newCategoryId },
          { rule: newRule, applyToExisting: false, applyToFuture: false }
        ))
        expect(store.getActions()).toEqual([
          {
            type: 'UPDATE_TRANSACTION',
            payload: { ...transactions[1], categoryId: newCategoryId }
          }, {
            type: 'SHOW_SNACKBAR',
            payload: { text: 'Transaction updated', status: 'success' }
          }
        ])
      })

      it('applying to existing and future should update rule', async () => {
        // The rule filter should be hidden in the interface
        await store.dispatch(actions.updateTransaction(
          account,
          { ...transactions[1], categoryId: newCategoryId },
          { rule: newRule, applyToExisting: true, applyToFuture: true }
        ))
        expect(store.getActions()).toEqual([
          {
            type: 'UPDATE_TRANSACTION',
            payload: { ...transactions[1], categoryId: newCategoryId }
          }, {
            type: 'UPDATE_RULE',
            payload: { ...newRule, id: transactions[1].ruleId }
          }, {
            type: 'UPDATE_TRANSACTIONS',
            payload: { [transactions[1].id]: { ...transactions[1], categoryId: newCategoryId } }
          }, {
            type: 'SHOW_SNACKBAR',
            payload: { text: 'Transaction updated', status: 'success' }
          }
        ])
      })

      // eslint-disable-next-line max-len
      it('applying to existing but not future should only update existing transactions but delete old rule', async () => {
        await store.dispatch(actions.updateTransaction(
          account,
          { ...transactions[1], categoryId: newCategoryId },
          { rule: newRule, applyToExisting: true, applyToFuture: false }
        ))
        const { ruleId, ...rest } = transactions[1]
        expect(store.getActions()).toEqual([
          {
            type: 'UPDATE_TRANSACTION',
            payload: { ...transactions[1], categoryId: newCategoryId }
          }, {
            type: 'UPDATE_TRANSACTIONS',
            payload: {
              [transactions[1].id]: {
                ...rest,
                categoryId: newCategoryId
              }
            }
          }, {
            type: 'DELETE_RULE',
            payload: rule.id
          }, {
            type: 'SHOW_SNACKBAR',
            payload: { text: 'Transaction updated', status: 'success' }
          }
        ])
      })

      it('applying to future but not existing should update rule and not update existing transactions', async () => {
        await store.dispatch(actions.updateTransaction(
          account,
          { ...transactions[1], categoryId: newCategoryId },
          { rule: newRule, applyToExisting: false, applyToFuture: true }
        ))
        expect(store.getActions()).toEqual([
          {
            type: 'UPDATE_TRANSACTION',
            payload: { ...transactions[1], categoryId: newCategoryId }
          }, {
            type: 'UPDATE_RULE',
            payload: { ...newRule, id: transactions[1].ruleId }
          }, {
            type: 'SHOW_SNACKBAR',
            payload: { text: 'Transaction updated', status: 'success' }
          }
        ])
      })
    })

    describe('with existing rule remove category', () => {
      let store
      const newRule = {
        ...rule,
        id: null,
        attributes: { },
        filterBy: { description: { type: 'equals', value: transactions[1].description } }
      }
      beforeEach(() => {
        store = initStore()
        expect(transactions[1].categoryId).toBeDefined()
        expect(transactions[1].ruleId).toBeDefined()
      })

      it('not applying to existing or future should do nothing', async () => {
        await store.dispatch(actions.updateTransaction(
          account,
          { ...transactions[1], categoryId: null },
          { rule: newRule, applyToExisting: false, applyToFuture: false }
        ))
        expect(store.getActions()).toEqual([
          {
            type: 'UPDATE_TRANSACTION',
            payload: { ...transactions[1], categoryId: null }
          }, {
            type: 'SHOW_SNACKBAR',
            payload: { text: 'Transaction updated', status: 'success' }
          }
        ])
      })

      it('applying to existing and future should delete rule', async () => {
        // The rule filter should be hidden in the interface
        await store.dispatch(actions.updateTransaction(
          account,
          { ...transactions[1], categoryId: null },
          { rule: newRule, applyToExisting: true, applyToFuture: true }
        ))
        expect(store.getActions()).toEqual([
          {
            type: 'UPDATE_TRANSACTION',
            payload: { ...transactions[1], categoryId: null }
          }, {
            type: 'DELETE_RULE',
            payload: transactions[1].ruleId
          }, {
            type: 'UPDATE_TRANSACTIONS',
            payload: { [transactions[0].id]: transactions[0] }
          }, {
            type: 'SHOW_SNACKBAR',
            payload: { text: 'Transaction updated', status: 'success' }
          }
        ])
      })

      // eslint-disable-next-line max-len
      it('applying to existing but not future should only update existing transactions but delete old rule', async () => {
        await store.dispatch(actions.updateTransaction(
          account,
          { ...transactions[1], categoryId: null },
          { rule: newRule, applyToExisting: true, applyToFuture: false }
        ))
        expect(store.getActions()).toEqual([
          {
            type: 'UPDATE_TRANSACTION',
            payload: { ...transactions[1], categoryId: null }
          }, {
            type: 'UPDATE_TRANSACTIONS',
            // The old rule is updated because it matches the old rule
            payload: {
              [transactions[0].id]: {
                ...transactions[0],
                categoryId,
                ruleId: rule.id
              }
            }
          }, {
            type: 'SHOW_SNACKBAR',
            payload: { text: 'Transaction updated', status: 'success' }
          }
        ])
      })

      it('applying to future but not existing should create rule and not update existing transactions', async () => {
        await store.dispatch(actions.updateTransaction(
          account,
          { ...transactions[1], categoryId: null },
          { rule: newRule, applyToExisting: false, applyToFuture: true }
        ))
        expect(store.getActions()).toEqual([
          {
            type: 'UPDATE_TRANSACTION',
            payload: { ...transactions[1], categoryId: null }
          }, {
            type: 'DELETE_RULE',
            payload: transactions[1].ruleId
          }, {
            type: 'SHOW_SNACKBAR',
            payload: { text: 'Transaction updated', status: 'success' }
          }
        ])
      })
    })
  })
})
