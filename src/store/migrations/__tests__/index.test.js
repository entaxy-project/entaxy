import faker from 'faker'
import migrations from '..'
import { initialState as accountsInitialState } from '../../accounts/reducer'
import { initialState as transactionsInitialState } from '../../transactions/reducer'
import { initialState as settingsInitialState } from '../../settings/reducer'
import { initialState as exchangeRatesInitialState } from '../../exchangeRates/reducer'
import { initialState as budgetInitialState } from '../../budget/reducer'

jest.mock('uuid/v4', () => {
  let value = 0
  return () => {
    value += 1
    return value
  }
})

describe('migrations', () => {
  describe('0', () => {
    const MIGRATION_VERSION = 0
    const state = {
      accounts: accountsInitialState,
      transactions: [{ name: 'new transactions' }] // some other state
    }

    it('should do nothing on empty state', () => {
      expect(migrations[MIGRATION_VERSION](state)).toEqual(state)
    })

    it('should add accountType', () => {
      const account = {
        id: 0,
        groupId: 'g1',
        name: 'Checking',
        institution: 'TD',
        openingBalance: 1000,
        currency: 'USD'
      }
      state.accounts.byId[0] = account
      expect(migrations[MIGRATION_VERSION](state)).toEqual({
        ...state,
        accounts: {
          ...state.accounts,
          byId: {
            [account.id]: { ...account, accountType: 'Bank' }
          }
        }
      })
    })
  })

  describe('1', () => {
    const MIGRATION_VERSION = 1
    const state = {
      settings: settingsInitialState,
      transactions: [{ name: 'new transactions' }] // some other state
    }

    it('should do nothing on empty state', () => {
      expect(migrations[MIGRATION_VERSION](state)).toEqual(state)
    })

    it('should cleanup settings', () => {
      state.settings.someOtherField = 'some data'
      expect(migrations[MIGRATION_VERSION](state)).toEqual({
        ...state,
        settings: {
          currency: state.settings.currency,
          locale: state.settings.locale
        }
      })
    })
  })

  describe('2', () => {
    const MIGRATION_VERSION = 2
    const state = {
      settings: settingsInitialState,
      transactions: transactionsInitialState,
      exchangeRates: exchangeRatesInitialState,
      someOtherState: 'some value'
    }

    it('should do nothing on empty state', () => {
      expect(migrations[MIGRATION_VERSION](state)).toEqual(state)
    })

    it('should update transaction amount', () => {
      state.transactions = {
        ...transactionsInitialState,
        list: [{ name: 'new transactions', amount: 1 }]
      }
      state.exchangeRates = {
        ...exchangeRatesInitialState,
        CAD: { 123: 1, 456: 2, dates: [123, 456] },
        USD: { 123: 1, 456: 2, dates: [123, 456] }
      }
      expect(migrations[MIGRATION_VERSION](state)).toEqual({
        ...state,
        transactions: {
          list: [{
            name: 'new transactions',
            amount: { accountCurrency: 1, localCurrency: null }
          }]
        },
        exchangeRates: {
          CAD: { 123: 1, 456: 2 },
          USD: { 123: 1, 456: 2 }
        }
      })
    })
  })

  describe('3', () => {
    const MIGRATION_VERSION = 3

    const state = {
      settings: settingsInitialState,
      transactions: transactionsInitialState,
      budget: budgetInitialState,
      someOtherState: 'some value'
    }

    it('should do nothing on empty state', () => {
      expect(migrations[MIGRATION_VERSION](state)).toEqual(state)
      const { budget, ...rest } = state
      expect(migrations[MIGRATION_VERSION](rest)).toEqual(rest)
    })

    it('should convert rules and update transactions', () => {
      const transaction = {
        accountId: faker.random.uuid(),
        description: 'Buy groceries',
        amount: {
          accountCurrency: faker.finance.amount(),
          localCurrency: faker.finance.amount()
        },
        createdAt: Date.now()
      }

      const categoryIds = [
        budgetInitialState.categoryTree[0].options[0].id,
        budgetInitialState.categoryTree[0].options[1].id,
        budgetInitialState.categoryTree[1].options[0].id
      ]
      const lastId = Object.keys(budgetInitialState.categoriesById).length

      /* eslint-disable object-curly-newline */
      state.transactions = {
        ...transactionsInitialState,
        list: [
          { ...transaction, id: 1, categoryId: categoryIds[0] },
          { ...transaction, id: 2, description: faker.lorem.words(), categoryId: categoryIds[0] },
          { ...transaction, id: 3, accountId: 'x', description: transaction.description },
          { ...transaction, id: 4, accountId: 'x', description: transaction.description, categoryId: categoryIds[0] },
          { ...transaction, id: 5, accountId: 'x', description: faker.lorem.words(), categoryId: categoryIds[1] },
          { ...transaction, id: 6, accountId: 'x', description: transaction.description, categoryId: categoryIds[0] },
          { ...transaction, id: 7, description: faker.lorem.words(), categoryId: categoryIds[2], ruleId: 'newRule' }
        ]
      }

      state.budget = {
        ...budgetInitialState,
        rules: {
          [state.transactions.list[0].description]: {
            categoryId: state.transactions.list[0].categoryId, type: 'exact_match', count: 1
          },
          [state.transactions.list[1].description]: {
            categoryId: state.transactions.list[1].categoryId, type: 'exact_match', count: 1
          },
          [state.transactions.list[4].description]: {
            categoryId: state.transactions.list[4].categoryId, type: 'exact_match', count: 1
          },
          newRule: {
            id: 'newRule',
            accountId: state.transactions.list[6].accountId,
            attributes: { categoryId: state.transactions.list[6].categoryId },
            filterBy: { description: { type: 'equals', value: state.transactions.list[6].description } }
          }
        }
      }

      expect(migrations[MIGRATION_VERSION](state)).toEqual({
        ...state,
        transactions: {
          list: [
            { ...state.transactions.list[0], ruleId: lastId + 1 },
            { ...state.transactions.list[1], ruleId: lastId + 3 },
            state.transactions.list[2],
            { ...state.transactions.list[3], ruleId: lastId + 2 },
            { ...state.transactions.list[4], ruleId: lastId + 4 },
            { ...state.transactions.list[5], ruleId: lastId + 2 },
            state.transactions.list[6]
          ]
        },
        budget: {
          ...state.budget,
          rules: {
            [lastId + 1]: {
              id: lastId + 1,
              accountId: state.transactions.list[0].accountId,
              attributes: { categoryId: state.transactions.list[0].categoryId },
              filterBy: { description: { type: 'equals', value: state.transactions.list[0].description } }
            },
            [lastId + 2]: {
              id: lastId + 2,
              accountId: state.transactions.list[3].accountId,
              attributes: { categoryId: state.transactions.list[3].categoryId },
              filterBy: { description: { type: 'equals', value: state.transactions.list[3].description } }
            },
            [lastId + 3]: {
              id: lastId + 3,
              accountId: state.transactions.list[1].accountId,
              attributes: { categoryId: state.transactions.list[1].categoryId },
              filterBy: { description: { type: 'equals', value: state.transactions.list[1].description } }
            },
            [lastId + 4]: {
              id: lastId + 4,
              accountId: state.transactions.list[4].accountId,
              attributes: { categoryId: state.transactions.list[4].categoryId },
              filterBy: { description: { type: 'equals', value: state.transactions.list[4].description } }
            },
            newRule: {
              id: 'newRule',
              accountId: state.transactions.list[6].accountId,
              attributes: { categoryId: state.transactions.list[6].categoryId },
              filterBy: { description: { type: 'equals', value: state.transactions.list[6].description } }
            }
          }
        }
      })
    })
  })
})
