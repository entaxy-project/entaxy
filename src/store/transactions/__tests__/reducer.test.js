import transactionReducer, { initialState } from '../reducer'
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
      const state = {
        ...initialState,
        list: [
          { ...transaction, id: 1, description: 'old name 1' },
          { ...transaction, id: 2, description: 'old name 2' }
        ]
      }
      const payload = { id: 1, description: 'new name 1' }
      expect(transactionReducer(state, { type, payload })).toEqual({
        ...state,
        list: [
          { ...transaction, id: 1, description: 'new name 1' },
          { ...transaction, id: 2, description: 'old name 2' }
        ]
      })
    })
  })

  describe('UPDATE_TRANSACTIONS', () => {
    it('should handle UPDATE_TRANSACTIONS', () => {
      const type = types.UPDATE_TRANSACTIONS
      const state = {
        ...initialState,
        list: [
          { ...transaction, id: 1, description: 'old name 1' },
          { ...transaction, id: 2, description: 'old name 2' },
          { ...transaction, id: 3, description: 'old name 3' }
        ]
      }
      const payload = {
        1: { description: 'new name 1' },
        2: { description: 'new name 2' }
      }
      expect(transactionReducer(state, { type, payload })).toEqual({
        ...state,
        list: [
          { ...transaction, id: 1, description: 'new name 1' },
          { ...transaction, id: 2, description: 'new name 2' },
          { ...transaction, id: 3, description: 'old name 3' }
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
})
