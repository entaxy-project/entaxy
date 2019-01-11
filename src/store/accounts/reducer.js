/* eslint-disable no-case-declarations */
import types from './types'

export const initialState = {
  byId: {}, // {id1: {id: id1, name: 'account1', institution: 'TD'}, id2: {...}}
  byInstitution: {} // {TD: {accountIds: [id1, id2], balance: 100, apiKey: XYZ}, BMO: {...}}
}

/*
// accounts: {
//   a1: {
//     id: 'a1',
//     description: 'Checking',
//     institution: 'TD',
//     currency: 'CAD',
//     currenctBalance: 10
//   },
//   a2: {
//     id: 'a2',
//     description: 'Checking',
//     institution: 'TD',
//     currency: 'CAD',
//     currenctBalance: 10,
//     groupId: 'g1'
//   }
// }

// institutions: {
//   'TD': {
//     balance: 0,
//     accountIds: ['id1'],
//     groups: {
//       g1: {
//         id: 'g1'
//         accountIds: ['id2'],
//         apiKey: 'ABC'
//       }
//     }
//   }
// }
*/

let accounts
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case types.LOAD_ACCOUNTS:
      return payload || initialState
    case types.CREATE_ACCOUNT:
      accounts = { ...state.byId, [payload.id]: payload }
      return {
        ...state,
        byId: accounts
      }
    case types.UPDATE_ACCOUNT:
      accounts = { ...state.byId, [payload.id]: payload }
      return {
        ...state,
        byId: accounts
      }
    case types.DELETE_ACCOUNT:
      const { [payload]: _, ...rest } = state.byId
      return {
        ...state,
        byId: rest
      }
    case types.UPDATE_GROUP_BY_INSTITUTION:
      return {
        ...state,
        byInstitution: payload
      }
    case types.CREATE_ACCOUNT_GROUP:
      const institutionData = state.byInstitution[payload.institution] || { accountIds: [], groups: {} }
      return {
        ...state,
        byInstitution: {
          ...state.byInstitution,
          [payload.institution]: {
            ...institutionData,
            groups: {
              ...institutionData.groups,
              [payload.accountGroup.id]: payload.accountGroup
            }
          }
        }
      }
    default:
      return state
  }
}
