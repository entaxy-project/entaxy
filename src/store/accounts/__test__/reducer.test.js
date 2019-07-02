import accountReducer, { initialState } from '../reducer'
import types from '../types'

jest.mock('uuid/v4', () => jest.fn(() => 1))

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

const account = {
  id: '1',
  name: 'Checking',
  institution: 'TD',
  initialBalance: 1000,
  currentBalance: {
    accountCurrency: 1000,
    localCurrency: 1000
  }
}

describe('account reducer', () => {
  it('should return initial state', () => {
    expect(accountReducer(undefined, {})).toEqual(initialState)
  })

  it('should handle LOAD_ACCOUNTS', () => {
    const type = types.LOAD_ACCOUNTS
    const payload = [account]
    expect(accountReducer(undefined, { type, payload })).toEqual(payload)
  })

  it('should handle LOAD_ACCOUNTS with no existing data', () => {
    const type = types.LOAD_ACCOUNTS
    expect(accountReducer(initialState, { type, payload: null })).toEqual(initialState)
  })

  it('should handle CREATE_ACCOUNT', () => {
    const type = types.CREATE_ACCOUNT
    const payload = account

    expect(accountReducer(initialState, { type, payload })).toEqual({
      ...initialState,
      byId: { 1: account }
    })
  })

  it('should handle UPDATE_ACCOUNT', () => {
    const type = types.UPDATE_ACCOUNT
    const state = {
      ...initialState,
      byId: { 1: account }
    }
    const payload = {
      id: '1',
      name: 'Savings',
      institution: 'BMO',
      initialBalance: 200,
      currentBalance: {
        accountCurrency: 200,
        localCurrency: 200
      }
    }

    expect(accountReducer(state, { type, payload })).toEqual({
      ...state,
      byId: { 1: payload }
    })
  })

  it('should handle DELETE_ACCOUNT', () => {
    const type = types.DELETE_ACCOUNT
    const state = {
      ...initialState,
      byId: { 1: account }
    }

    expect(accountReducer(state, { type, payload: '1' })).toEqual(initialState)
  })

  describe('GROUP_BY_INSTITUTION', () => {
    const type = types.GROUP_BY_INSTITUTION
    const accounts = [{
      id: 'a1',
      groupId: 'g1',
      institution: 'BMO',
      currentBalance: {
        accountCurrency: 100,
        localCurrency: 100
      }
    }, {
      id: 'a2',
      groupId: 'g1',
      institution: 'BMO',
      currentBalance: {
        accountCurrency: 200,
        localCurrency: 200
      }
    }, {
      id: 'a3',
      groupId: 'g3',
      institution: 'BMO',
      currentBalance: {
        accountCurrency: 300,
        localCurrency: 300
      }
    }, {
      id: 'a4',
      groupId: 'g4',
      institution: 'TD',
      currentBalance: {
        accountCurrency: 400,
        localCurrency: 400
      }
    }, {
      id: 'a5',
      groupId: 'g5',
      institution: 'Coinbase',
      currentBalance: {
        accountCurrency: 500,
        localCurrency: 500
      }
    }]
    const byInstitutionAccount1 = {
      BMO: {
        balance: accounts[0].currentBalance,
        groups: {
          [accounts[0].groupId]: {
            id: accounts[0].groupId,
            balance: accounts[0].currentBalance.localCurrency,
            accountIds: [accounts[0].id]
          }
        }
      }
    }

    it('should not group with no accounts', () => {
      const state = initialState
      expect(accountReducer(state, { type })).toEqual(initialState)
    })

    it('should group 1 account', () => {
      const state = {
        byId: { [accounts[0].id]: accounts[0] },
        byInstitution: {
          BMO: {
            balance: accounts[0].currentBalance.localCurrency + 100,
            groups: {
              [accounts[0].groupId]: {
                id: accounts[0].groupId,
                type: 'default',
                balance: accounts[0].currentBalance.localCurrency + 200,
                accountIds: [accounts[0].id]
              }
            }
          }
        }
      }

      expect(accountReducer(state, { type })).toEqual({
        ...state,
        byInstitution: {
          BMO: {
            balance: accounts[0].currentBalance.localCurrency,
            groups: {
              [accounts[0].groupId]: {
                id: accounts[0].groupId,
                type: 'default',
                balance: accounts[0].currentBalance.localCurrency,
                accountIds: [accounts[0].id]
              }
            }
          }
        }
      })
    })

    it('should group 2 accounts on the same group', () => {
      const state = {
        byId: {
          [accounts[0].id]: accounts[0],
          [accounts[1].id]: accounts[1]
        },
        byInstitution: byInstitutionAccount1
      }
      expect(accounts[0].groupId).toEqual(accounts[1].groupId)
      expect(accountReducer(state, { type })).toEqual({
        ...state,
        byInstitution: {
          BMO: {
            balance: accounts[0].currentBalance.localCurrency + accounts[1].currentBalance.localCurrency,
            groups: {
              [accounts[0].groupId]: {
                id: accounts[0].groupId,
                type: 'default',
                balance: accounts[0].currentBalance.localCurrency + accounts[1].currentBalance.localCurrency,
                accountIds: [accounts[0].id, accounts[1].id]
              }
            }
          }
        }
      })
    })

    it('should group 2 accounts on different groups from the same institution', () => {
      const state = {
        byId: {
          [accounts[0].id]: accounts[0],
          [accounts[2].id]: accounts[2]
        },
        byInstitution: {}
      }
      expect(accounts[0].groupId).not.toEqual(accounts[2].groupId)
      expect(accountReducer(state, { type })).toEqual({
        ...state,
        byInstitution: {
          BMO: {
            balance: accounts[0].currentBalance.localCurrency + accounts[2].currentBalance.localCurrency,
            groups: {
              [accounts[0].groupId]: {
                id: accounts[0].groupId,
                type: 'default',
                balance: accounts[0].currentBalance.localCurrency,
                accountIds: [accounts[0].id]
              },
              [accounts[2].groupId]: {
                id: accounts[2].groupId,
                type: 'default',
                balance: accounts[2].currentBalance.localCurrency,
                accountIds: [accounts[2].id]
              }
            }
          }
        }
      })
    })

    it('should group 2 accounts on different groups from different institutions', () => {
      const state = {
        byId: {
          [accounts[0].id]: accounts[0],
          [accounts[3].id]: accounts[3]
        },
        byInstitution: {}
      }
      expect(accounts[0].groupId).not.toEqual(accounts[3].groupId)
      expect(accountReducer(state, { type })).toEqual({
        ...state,
        byInstitution: {
          BMO: {
            balance: accounts[0].currentBalance.localCurrency,
            groups: {
              [accounts[0].groupId]: {
                id: accounts[0].groupId,
                type: 'default',
                balance: accounts[0].currentBalance.localCurrency,
                accountIds: [accounts[0].id]
              }
            }
          },
          TD: {
            balance: accounts[3].currentBalance.localCurrency,
            groups: {
              [accounts[3].groupId]: {
                id: accounts[3].groupId,
                type: 'default',
                balance: accounts[3].currentBalance.localCurrency,
                accountIds: [accounts[3].id]
              }
            }
          }
        }
      })
    })

    it('should merge with existing group and institution data', () => {
      const state = {
        byId: {
          [accounts[0].id]: accounts[0],
          [accounts[4].id]: accounts[4]
        },
        byInstitution: {
          BMO: {
            balance: accounts[0].currentBalance.localCurrency,
            groups: {
              [accounts[0].groupId]: {
                id: accounts[0].groupId,
                type: 'default',
                balance: accounts[0].currentBalance.localCurrency,
                accountIds: [accounts[0].id]
              }
            }
          },
          Coinbase: {
            balance: accounts[4].currentBalance.localCurrency,
            groups: {
              [accounts[4].groupId]: {
                id: accounts[4].groupId,
                type: 'api',
                balance: accounts[4].currentBalance.localCurrency,
                accountIds: [accounts[4].id],
                apiKey: 'ABC', // existing data
                apiSecret: 'DEF'
              }
            }
          }
        }
      }
      expect(accounts[0].groupId).not.toEqual(accounts[3].groupId)
      expect(accountReducer(state, { type })).toEqual(state)
    })
  })

  describe('CREATE_ACCOUNT_GROUP', () => {
    it('should return the state when payload is empty', () => {
      const type = types.CREATE_ACCOUNT_GROUP
      expect(accountReducer(initialState, { type })).toEqual(initialState)
    })

    it('whould add new group when none exist', () => {
      const type = types.CREATE_ACCOUNT_GROUP
      const payload = {
        institution: 'TD',
        accountGroup: { id: 'g1', accountIds: ['a1', 'a2'] }
      }

      expect(accountReducer(initialState, { type, payload })).toEqual({
        ...initialState,
        byInstitution: {
          TD: {
            groups: {
              g1: payload.accountGroup
            }
          }
        }
      })
    })

    it('whould add new group when the same institution already exists', () => {
      const type = types.CREATE_ACCOUNT_GROUP
      const accountGroup1 = { id: 'g1', accountIds: ['a1', 'a2'] }
      const accountGroup2 = { id: 'g2', accountIds: ['a3'] }
      const state = {
        ...initialState,
        byInstitution: {
          TD: {
            groups: { g1: accountGroup1 }
          }
        }
      }
      const payload = {
        institution: 'TD',
        accountGroup: accountGroup2
      }

      expect(accountReducer(state, { type, payload })).toEqual({
        ...state,
        byInstitution: {
          TD: {
            groups: { g1: accountGroup1, g2: accountGroup2 }
          }
        }
      })
    })

    it('whould add new group when a different institution already exists', () => {
      const type = types.CREATE_ACCOUNT_GROUP
      const accountGroup1 = { id: 'g1', accountIds: ['a1', 'a2'] }
      const accountGroup2 = { id: 'g2', accountIds: ['a3'] }
      const state = {
        ...initialState,
        byInstitution: {
          TD: {
            groups: { g1: accountGroup1 }
          }
        }
      }
      const payload = {
        institution: 'BMO',
        accountGroup: accountGroup2
      }

      expect(accountReducer(state, { type, payload })).toEqual({
        ...state,
        byInstitution: {
          TD: {
            groups: { g1: accountGroup1 }
          },
          BMO: {
            groups: { g2: accountGroup2 }
          }
        }
      })
    })
  })
})
