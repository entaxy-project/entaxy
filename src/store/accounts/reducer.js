/* eslint-disable no-case-declarations */
import types from './types'

export const initialState = {
  byId: {}, // {id1: {id: id1, name: 'account1', institution: 'TD'}, id2: {...}}
  byInstitution: {} // {TD: {accountIds: [id1, id2], balance: 100, apiKey: XYZ}, BMO: {...}}
}


let accounts
let institutionData
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
    case types.UPDATE_GROUPS_BY_INSTITUTION:
      return {
        ...state,
        byInstitution: payload
      }
    case types.CREATE_ACCOUNT_GROUP:
    case types.UPDATE_ACCOUNT_GROUP:
      institutionData = state.byInstitution[payload.institution] || { groups: {} }
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
