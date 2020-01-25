import faker from 'faker'
import transactionReducer, { initialState, insertSorted } from '../reducer'
import types from '../types'

const transaction = {
  accountId: 1,
  description: 'Shopping Mart',
  amount: 1,
  createdAt: Date.now()
}

describe('transaction reducer', () => {
  describe('initialState', () => {
    it('should return initial state', () => {
      expect(transactionReducer(undefined, {})).toEqual(initialState)
    })
  })

  describe('LOAD_TRANSACTIONS', () => {
    it('should handle LOAD_TRANSACTIONS', () => {
      const type = types.LOAD_TRANSACTIONS
      const payload = [transaction]
      expect(transactionReducer(undefined, { type, payload })).toEqual(payload)
    })

    it('should handle LOAD_TRANSACTIONS with no existing transactions', () => {
      const type = types.LOAD_TRANSACTIONS
      const payload = null
      expect(transactionReducer(undefined, { type, payload })).toEqual(initialState)
    })
  })

  describe('CREATE_TRANSACTION', () => {
    it('should handle CREATE_TRANSACTION with no existing transactions', () => {
      const type = types.CREATE_TRANSACTION
      const payload = transaction
      expect(transactionReducer(undefined, { type, payload })).toEqual({ ...initialState, list: [payload] })
    })

    it('should handle CREATE_TRANSACTION with existing transactions', () => {
      const type = types.CREATE_TRANSACTION
      const state = {
        ...initialState,
        list: [{
          institution: 'TD',
          account: 'RRSP',
          type: 'buy',
          ticker: 'VCE.TO',
          shares: '2',
          bookValue: '2',
          createdAt: Date.now()
        }]
      }
      const payload = transaction
      expect(transactionReducer(state, { type, payload })).toEqual({ ...state, list: [...state.list, payload] })
    })
  })

  describe('UPDATE_TRANSACTION', () => {
    it('should handle UPDATE_TRANSACTION', () => {
      const type = types.UPDATE_TRANSACTION
      const transactions = [
        { ...transaction, id: faker.random.uuid(), description: 'old name 1' },
        { ...transaction, id: faker.random.uuid(), description: 'old name 2' }
      ]
      const state = { ...initialState, list: transactions }
      const payload = { ...transactions[0], description: 'new name 1' }
      expect(transactionReducer(state, { type, payload })).toEqual({
        ...state,
        list: [{ ...transactions[0], description: 'new name 1' }, transactions[1]]
      })
    })
  })

  describe('UPDATE_TRANSACTIONS', () => {
    it('should handle UPDATE_TRANSACTIONS', () => {
      const type = types.UPDATE_TRANSACTIONS
      const transactions = [
        { ...transaction, id: faker.random.uuid(), description: 'old name 1' },
        { ...transaction, id: faker.random.uuid(), description: 'old name 2' },
        { ...transaction, id: faker.random.uuid(), description: 'old name 3' }
      ]
      const state = { ...initialState, list: transactions }
      const payload = {
        [transactions[0].id]: { ...transactions[0], description: 'new name 1' },
        [transactions[1].id]: { ...transactions[1], description: 'new name 2' }
      }
      expect(transactionReducer(state, { type, payload })).toEqual({
        ...state,
        list: [
          { ...transactions[0], description: 'new name 1' },
          { ...transactions[1], description: 'new name 2' },
          { ...transactions[2], description: 'old name 3' }
        ]
      })
    })
  })

  describe('UPATE_TRANSACTION_FIELD_IF_MATCHED', () => {
    it('should upate single field in transactions', () => {
      const type = types.UPATE_TRANSACTION_FIELD_IF_MATCHED
      const payload = {
        fieldName: 'categoryId',
        values: [1, 2],
        newValue: undefined
      }
      const state = {
        list: [
          transaction,
          { id: 2, categoryId: 1 },
          { id: 3, categoryId: 2 },
          { id: 4, categoryId: undefined },
          { id: 5, categoryId: 3 }
        ]
      }
      expect(transactionReducer(state, { type, payload })).toEqual({
        ...state,
        list: [
          transaction,
          { id: 2, categoryId: undefined },
          { id: 3, categoryId: undefined },
          { id: 4, categoryId: undefined },
          { id: 5, categoryId: 3 }
        ]
      })
    })
  })

  describe('DELETE_TRANSACTIONS', () => {
    it('should handle DELETE_TRANSACTIONS', () => {
      const type = types.DELETE_TRANSACTIONS
      const state = {
        ...initialState,
        list: [transaction]
      }
      const payload = [state.list[0].id]
      expect(transactionReducer(state, { type, payload })).toEqual(initialState)
    })
  })

  describe('ADD_TRANSACTIONS', () => {
    it('should handle ADD_TRANSACTIONS to existing transactions', () => {
      const type = types.ADD_TRANSACTIONS
      const state = {
        ...initialState,
        list: [{
          id: 1,
          accountId: 1,
          amount: 2,
          createdAt: Date.now()
        }]
      }
      const payload = [{
        id: 2,
        accountId: 1,
        amount: 2,
        createdAt: Date.now()
      }, {
        id: 3,
        accountId: 1,
        amount: 3,
        createdAt: Date.now()
      }]
      expect(transactionReducer(state, { type, payload })).toEqual({
        ...state,
        list: [...state.list, ...payload]
      })
    })
  })

  describe.only('locationOf', () => {
    const transactions = [
      { createdAt: 1, description: '1' },
      { createdAt: 2, description: '2' },
      { createdAt: 4, description: '3' }
    ]
    it('should insert when array is empty', () => {
      expect(insertSorted({ createdAt: 0 }, [])).toEqual([{ createdAt: 0 }])
    })

    it('should insert at the beginning', () => {
      const elem = { createdAt: 0 }
      expect(insertSorted(elem, transactions)).toEqual([
        elem,
        { createdAt: 1, description: '1' },
        { createdAt: 2, description: '2' },
        { createdAt: 4, description: '3' }
      ])
    })

    it('should insert at the end', () => {
      const elem = { createdAt: 5 }
      expect(insertSorted(elem, transactions)).toEqual([
        { createdAt: 1, description: '1' },
        { createdAt: 2, description: '2' },
        { createdAt: 4, description: '3' },
        elem
      ])
    })

    it('should insert in the middle', () => {
      const elem = { createdAt: 3 }
      expect(insertSorted(elem, transactions)).toEqual([
        { createdAt: 1, description: '1' },
        { createdAt: 2, description: '2' },
        elem,
        { createdAt: 4, description: '3' }
      ])
    })

    it('should insert in the middle before the same match', () => {
      const elem = { createdAt: 4 }
      expect(insertSorted(elem, transactions)).toEqual([
        { createdAt: 1, description: '1' },
        { createdAt: 2, description: '2' },
        elem,
        { createdAt: 4, description: '3' }
      ])
    })
  })
})
