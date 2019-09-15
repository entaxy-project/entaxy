import migrations from '..'
import { initialState as accountsInitialState } from '../../accounts/reducer'

describe('migrations', () => {
  it('0 - should add accountType', () => {
    const state = {
      accounts: accountsInitialState
    }
    expect(migrations['0'](state)).toEqual(state)

    const account = {
      id: 0,
      groupId: 'g1',
      name: 'Checking',
      institution: 'TD',
      openingBalance: 1000,
      currency: 'USD'
    }
    state.accounts.byId[0] = account
    expect(migrations['0'](state)).toEqual({
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
