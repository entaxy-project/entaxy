import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import faker from 'faker'
import * as actions from '../actions'
import types from '../types'
import { initialState as budgetInitialState } from '../reducer'
import { initialState as transactionsInitialState } from '../../transactions/reducer'

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
const transaction = {
  accountId: faker.random.uuid(),
  description: 'Buy groceries',
  amount: {
    accountCurrency: faker.finance.amount(),
    localCurrency: faker.finance.amount()
  },
  createdAt: Date.now()
}

const catId = budgetInitialState.categoryTree[0].options[0].id
const rule = {
  id: 'r1',
  accountId: transaction.accountId,
  attributes: { catId },
  filterBy: { description: { type: 'equals', value: transaction.description } }
}

const budget = { ...budgetInitialState, rules: { r1: rule } }

describe('budget actions', () => {
  it('should load budget', () => {
    expect(actions.loadBudget(budget)).toEqual({
      type: types.LOAD_BUDGET,
      payload: budget
    })
  })

  describe('categories', () => {
    it('should create a group', () => {
      const store = mockStore({})
      store.dispatch(actions.createCategory({ name: 'group 1' }))
      expect(store.getActions()).toEqual([{
        type: 'CREATE_CATEGORY',
        payload: { name: 'group 1', id: Object.keys(budgetInitialState.categoriesById).length + 1 }
      },
      {
        type: 'SHOW_SNACKBAR',
        payload: { status: 'success', text: 'Group created' }
      }])
    })

    it('should create a category', () => {
      const store = mockStore({ budget })
      store.dispatch(actions.createCategory({ name: 'cat 1' }, 1))
      expect(store.getActions()).toEqual([{
        type: 'CREATE_CATEGORY',
        payload: {
          name: 'cat 1',
          id: Object.keys(budgetInitialState.categoriesById).length + 2,
          parentId: 1
        }
      },
      {
        type: 'SHOW_SNACKBAR',
        payload: { status: 'success', text: 'Category created' }
      }])
    })

    it('should update a group', () => {
      const store = mockStore({ budget })
      store.dispatch(actions.updateCategory({ id: 0, name: 'group 1' }))
      expect(store.getActions()).toEqual([{
        type: 'UPDATE_CATEGORY',
        payload: { name: 'group 1', id: 0 }
      },
      {
        type: 'SHOW_SNACKBAR',
        payload: { status: 'success', text: 'Group updated' }
      }])
    })

    it('should update a category', () => {
      const store = mockStore({ budget })
      store.dispatch(actions.updateCategory({ id: 1, name: 'cat 1', parentId: 0 }))
      expect(store.getActions()).toEqual([{
        type: 'UPDATE_CATEGORY',
        payload: { name: 'cat 1', id: 1, parentId: 0 }
      },
      {
        type: 'SHOW_SNACKBAR',
        payload: { status: 'success', text: 'Category updated' }
      }])
    })

    it('should delete a group', () => {
      const store = mockStore({ budget })
      const groupIdToDelete = 1
      store.dispatch(actions.deleteCategory(groupIdToDelete))
      expect(('parentId' in budget.categoriesById[groupIdToDelete])).toBe(false)
      const categoryIds = Object.values(budget.categoriesById).reduce((res, cat) => (
        cat.parentId === groupIdToDelete ? [...res, cat.id] : res
      ), [groupIdToDelete])

      expect(store.getActions()).toEqual([{
        type: 'DELETE_CATEGORY',
        payload: groupIdToDelete
      },
      {
        type: 'UPATE_TRANSACTION_FIELD_IF_MATCHED',
        payload: {
          fieldName: 'categoryId',
          newValue: undefined,
          values: categoryIds
        }
      },
      {
        type: 'SHOW_SNACKBAR',
        payload: { status: 'success', text: 'Group deleted' }
      }])
    })

    it('should delete a category', () => {
      const store = mockStore({ budget })
      const categoryIdToDelete = 2
      store.dispatch(actions.deleteCategory(categoryIdToDelete))
      expect(('parentId' in budget.categoriesById[categoryIdToDelete])).toBe(true)
      expect(store.getActions()).toEqual([{
        type: 'DELETE_CATEGORY',
        payload: categoryIdToDelete
      },
      {
        type: 'UPATE_TRANSACTION_FIELD_IF_MATCHED',
        payload: {
          fieldName: 'categoryId',
          newValue: undefined,
          values: [categoryIdToDelete]
        }
      },
      {
        type: 'SHOW_SNACKBAR',
        payload: { status: 'success', text: 'Category deleted' }
      }])
    })
  })

  describe('rules', () => {
    it('should create a rule', () => {
      const store = mockStore({})
      const lastId = Object.keys(budgetInitialState.categoriesById).length
      store.dispatch(actions.createRule(rule))
      expect(store.getActions()).toEqual([{
        type: 'CREATE_RULE',
        payload: { ...rule, id: lastId + 3 }
      }])
    })

    it('should update a rule', () => {
      const store = mockStore({
        budget: { ...budgetInitialState, rules: { r1: { ...rule, id: 'r1' } } }
      })
      store.dispatch(actions.updateRule({ ...rule, a: 1 }))
      expect(store.getActions()).toEqual([{
        type: 'UPDATE_RULE',
        payload: { ...rule, a: 1 }
      }])
    })

    it('should delete a rule', () => {
      const store = mockStore({
        budget: { ...budgetInitialState, rules: { r1: { ...rule, id: 'r1' } } }
      })
      store.dispatch(actions.deleteRule('r1'))
      expect(store.getActions()).toEqual([{
        type: 'DELETE_RULE',
        payload: 'r1'
      }])
    })

    describe('transactionMatches', () => {
      it('returns false if there is no filter', () => {
        expect(actions.transactionMatches(transaction, transaction.accountId, null)).toBe(false)
      })

      it('returns false if the filter is empty', () => {
        const filter = { }
        expect(actions.transactionMatches(transaction, transaction.accountId, filter)).toBe(false)
      })

      it('returns false if the description filter type is imvalid', () => {
        const filter = { description: { type: 'bogus', value: transaction.description } }
        expect(actions.transactionMatches(transaction, transaction.accountId, filter)).toBe(false)
      })

      it('returns false if accountId doens\'t match', () => {
        const filter = { description: { type: 'equals', value: transaction.description } }
        expect(actions.transactionMatches(transaction, 'bogus', filter)).toBe(false)
      })

      it('matches description with equals', () => {
        const filter = { description: { type: 'equals', value: transaction.description } }
        expect(actions.transactionMatches(transaction, transaction.accountId, filter)).toBe(true)
        expect(actions.transactionMatches(transaction, transaction.accountId, {
          ...filter, description: { ...filter.description, value: 'bogus' }
        })).toBe(false)
      })

      it('matches description with start_with', () => {
        const value = transaction.description.slice(0, Math.ceil(transaction.description.length / 2))
        const filter = { description: { type: 'start_with', value } }
        expect(actions.transactionMatches(transaction, transaction.accountId, filter)).toBe(true)
        expect(actions.transactionMatches(transaction, transaction.accountId, {
          ...filter, description: { ...filter.description, value: `bogus${value}` }
        })).toBe(false)
      })

      it('matches description with end_with', () => {
        const value = transaction.description.slice(-Math.ceil(transaction.description.length / 2))
        const filter = { description: { type: 'end_with', value } }
        expect(actions.transactionMatches(transaction, transaction.accountId, filter)).toBe(true)
        expect(actions.transactionMatches(transaction, transaction.accountId, {
          ...filter, description: { ...filter.description, value: `bogus${value}` }
        })).toBe(false)
      })

      it('matches description with contain', () => {
        const value = transaction.description.slice(1, Math.ceil(transaction.description.length / 2))
        const filter = { description: { type: 'contain', value } }
        expect(actions.transactionMatches(transaction, transaction.accountId, filter)).toBe(true)
        expect(actions.transactionMatches(transaction, transaction.accountId, {
          ...filter, description: { ...filter.description, value: `bogus${value}` }
        })).toBe(false)
      })

      it('returns false if the amount filter type is imvalid', () => {
        const value = transaction.amount.accountCurrency
        const filter = { amount: { type: 'bogus', value } }
        expect(actions.transactionMatches(transaction, transaction.accountId, filter)).toBe(false)
      })

      it('matches amount', () => {
        const value = transaction.amount.accountCurrency
        const filter = { amount: { type: 'equals', value } }
        expect(actions.transactionMatches(transaction, transaction.accountId, filter)).toBe(true)
        expect(actions.transactionMatches(transaction, transaction.accountId, {
          ...filter, amount: { ...filter.amount, value: -value }
        })).toBe(false)
      })
    })

    describe('APPLY_RULE', () => {
      /* eslint-disable object-curly-newline */
      const transactions = [
        { ...transaction, id: 1 },
        { ...transaction, id: 2, description: faker.lorem.words(), catId, ruleId: rule.id },
        { ...transaction, id: 3, accountId: 'x' },
        { ...transaction, id: 4, accountId: 'x', description: faker.lorem.words(), catId }
      ]

      it('should not do anything with no transactions', () => {
        const store = mockStore({
          transactions: transactionsInitialState
        })
        store.dispatch(actions.applyRule(rule))
        expect(store.getActions()).toEqual([])
      })

      it('should not do anything with no matching transactions', () => {
        const store = mockStore({
          transactions: { ...transactionsInitialState, list: transactions }
        })
        store.dispatch(actions.applyRule({ ...rule, filterBy: {} }))
        expect(store.getActions()).toEqual([])
      })

      it('should remove rule if it\'s being replaced with another', () => {
        const store = mockStore({
          transactions: { ...transactionsInitialState, list: transactions },
          budget: { ...budgetInitialState, rules: { [rule.id]: rule } }
        })
        const newRule = {
          ...rule,
          id: 'new',
          attributes: { categoryId: 'xyz' },
          filterBy: { description: { type: 'equals', value: transactions[1].description } }
        }
        store.dispatch(actions.applyRule(newRule))
        expect(store.getActions()).toEqual([
          {
            type: 'UPDATE_TRANSACTIONS',
            payload: {
              [transactions[1].id]: {
                ...transactions[1],
                categoryId: 'xyz',
                ruleId: 'new'
              }
            }
          }, {
            type: 'DELETE_RULE',
            payload: rule.id
          }
        ])
      })

      it('should replace with transferAccountId', () => {
        const store = mockStore({
          transactions: { ...transactionsInitialState, list: transactions },
          budget: { ...budgetInitialState, rules: { [rule.id]: rule } }
        })
        const newRule = {
          ...rule,
          id: 'new',
          attributes: { transfer: { accountId: 'a1', direction: 'to' } },
          filterBy: { description: { type: 'equals', value: transactions[1].description } }
        }
        store.dispatch(actions.applyRule(newRule))
        const { categoryId, ...rest } = transactions[1]
        expect(store.getActions()).toEqual([
          {
            type: 'UPDATE_TRANSACTIONS',
            payload: {
              [transactions[1].id]: {
                ...rest,
                transferAccountId: 'a1',
                transferDirection: 'to',
                ruleId: 'new'
              }
            }
          }, {
            type: 'DELETE_RULE',
            payload: rule.id
          }
        ])
      })

      it('should clear all attributes if clearAttributes is true', () => {
        const store = mockStore({
          transactions: { ...transactionsInitialState, list: transactions },
          budget: { ...budgetInitialState, rules: { [rule.id]: rule } }
        })
        const newRule = {
          ...rule,
          id: 'new',
          attributes: { categoryId: 'xyz' },
          filterBy: { description: { type: 'equals', value: transactions[1].description } }
        }
        store.dispatch(actions.applyRule(newRule, { clearAttributes: true }))
        const { categoryId, ruleId, ...rest } = transactions[1]
        expect(store.getActions()).toEqual([
          {
            type: 'UPDATE_TRANSACTIONS',
            payload: { [transactions[1].id]: rest }
          }, {
            type: 'DELETE_RULE',
            payload: rule.id
          }
        ])
      })

      it('should clear all attributes if rule attributes is empty', () => {
        const store = mockStore({
          transactions: { ...transactionsInitialState, list: transactions },
          budget: { ...budgetInitialState, rules: { [rule.id]: rule } }
        })
        const newRule = {
          accountId: transactions[1].accountId,
          id: 'new',
          filterBy: { description: { type: 'equals', value: transactions[1].description } }
        }
        store.dispatch(actions.applyRule(newRule))
        const { categoryId, ...rest } = transactions[1]
        expect(store.getActions()).toEqual([
          {
            type: 'UPDATE_TRANSACTIONS',
            payload: { [transactions[1].id]: { ...rest, ruleId: 'new' } }
          }, {
            type: 'DELETE_RULE',
            payload: rule.id
          }
        ])
      })
    })
  })
})
