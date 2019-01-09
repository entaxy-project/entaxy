/* eslint-disable no-case-declarations */
import types from './types'

export const initialState = {
  byId: {}, // {id1: {id: id1, name: 'account1', institution: 'TD'}, id2: {...}}
  byInstitution: {} // {TD: {accountIds: [id1, id2], balance: 100, apiKey: XYZ}, BMO: {...}}
}

export const sortedAccountsGroupedByInstitution = (state, accountsArray) => {
  // Group sorted accounts by institution
  // results in something like:
  // {
  //   TD: {accountIds: [id1, id2], balance: 100},
  //   BMO: {accountIds: [id3], balance: 200}
  // }
  const groupedAccountIds = accountsArray
    // Sort accounts by name
    .sort((a, b) => (a.name > b.name))
    // Group them by institution
    .reduce((result, account) => {
      const { id, institution, currentBalance } = account
      const institutionData = result[institution] || {}
      const institutionAccountIds = institutionData.accountIds || []
      const institutionBalance = institutionData.balance || 0
      return {
        ...result,
        [institution]: {
          ...institutionData,
          accountIds: [...institutionAccountIds, id],
          balance: institutionBalance + currentBalance
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
        ...state.byInstitution[institution],
        ...groupedAccountIds[institution]
      }
    }), {})
}

let accounts
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case types.LOAD_ACCOUNTS:
      return payload || initialState
    case types.CREATE_ACCOUNT:
      accounts = { ...state.byId, [payload.id]: payload }
      return {
        ...state,
        byId: accounts,
        byInstitution: sortedAccountsGroupedByInstitution(state, Object.values(accounts))
      }
    case types.UPDATE_ACCOUNT:
      accounts = { ...state.byId, [payload.id]: payload }
      return {
        ...state,
        byId: accounts,
        byInstitution: sortedAccountsGroupedByInstitution(state, Object.values(accounts))
      }
    case types.DELETE_ACCOUNT:
      const { [payload]: _, ...rest } = state.byId

      return {
        ...state,
        byId: rest,
        byInstitution: sortedAccountsGroupedByInstitution(state, Object.values(rest))
      }
    case types.UPDATE_INSTITUTION_DATA:
      return {
        ...state,
        byInstitution: {
          ...state.byInstitution,
          [payload.institution]: {
            ...state.byInstitution[payload.institution],
            ...payload.data
          }
        }
      }
    default:
      return state
  }
}
