/* eslint-disable no-case-declarations */
import types from './types'

export const initialState = {
  byId: {}, // {id1: {id: id1, name: 'account1', institution: 'TD'}, id2: {...}}
  byInstitution: {} // {TD: {accountIds: [id1, id2], balance: 100, apiKey: XYZ}, BMO: {...}}
}

export const groupByInstitution = ({ byId, byInstitution }) => {
  // Group sorted accounts by institution
  // results in something like:
  // {
  //   TD: {accountIds: [id1, id2], balance: 100},
  //   BMO: {accountIds: [id3], balance: 200}
  // }
  const groupedAccountIds = Object.values(byId)
    // Sort accounts by name
    .sort((a, b) => (a.name > b.name))
    // Group them by institution
    .reduce((result, account) => {
      const {
        id,
        institution,
        groupId,
        currentBalance
      } = account

      // Merge existing institution data
      const existingInstitutionData = byInstitution[institution] || { groups: {} }
      const currentInstitutionData = (result[institution] || { balance: 0, groups: {} })
      const newInstitutionData = { ...existingInstitutionData, ...currentInstitutionData }

      // Merge existing group data
      const existingGroupData = existingInstitutionData.groups[groupId] || {}
      const currentGroupData = currentInstitutionData.groups[groupId] || {
        id: groupId,
        type: 'default',
        balance: 0,
        accountIds: []
      }
      const newGroupData = { ...existingGroupData, ...currentGroupData }

      return {
        ...result,
        [institution]: {
          ...newInstitutionData,
          balance: currentInstitutionData.balance + currentBalance,
          groups: {
            ...newInstitutionData.groups,
            [groupId]: {
              ...newGroupData,
              balance: currentGroupData.balance + currentBalance,
              accountIds: [...newGroupData.accountIds, id]
            }
          }
        }
      }
    }, {})

    // But now the institutions are not sorted and we lost existing institution data
  return Object.keys(groupedAccountIds)
    // Sort institutions by name
    .sort((a, b) => (a > b))
    // Merge new sorted institutions with existing institution data
    .reduce((result, institution) => ({
      ...result,
      [institution]: {
        ...byInstitution[institution],
        ...groupedAccountIds[institution]
      }
    }), {})
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
    case types.GROUP_BY_INSTITUTION:
      return {
        ...state,
        byInstitution: groupByInstitution(state)
      }
    case types.CREATE_ACCOUNT_GROUP:
    case types.UPDATE_ACCOUNT_GROUP:
      if (payload === undefined) return state
      const { institution, accountGroup } = payload
      institutionData = state.byInstitution[institution] || { groups: {} }
      return {
        ...state,
        byInstitution: {
          ...state.byInstitution,
          [institution]: {
            ...institutionData,
            groups: {
              ...institutionData.groups,
              [accountGroup.id]: accountGroup
            }
          }
        }
      }
    default:
      return state
  }
}
