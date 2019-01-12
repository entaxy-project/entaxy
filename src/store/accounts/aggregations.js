/* eslint-disable no-console */
import types from './types'

export const calculateCurrentBalance = (account, transactions = []) => (
  transactions.reduce((balance, transaction) => {
    if (transaction.createdAt > account.openingBalanceDate) {
      return balance + transaction.amount
    }
    return balance
  }, account.openingBalance)
)

export const groupByInstitution = () => {
  return (dispatch, getState) => {
    const { byId, byInstitution } = getState().accounts
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
        const institutionData = result[institution] || { groups: {} }
        const institutionBalance = institutionData.balance || 0
        const accountGroups = institutionData.groups
        const accountGroupData = accountGroups[groupId] || {
          id: groupId,
          type: 'default',
          balance: 0,
          accountIds: []
        }
        const existingInstitutionData = byInstitution[institution] || { groups: {} }
        const existingAccountGroupData = existingInstitutionData.groups[groupId] || {
          id: groupId,
          type: 'default',
          balance: 0,
          accountIds: []
        }

        return {
          ...result,
          [institution]: {
            ...existingInstitutionData,
            balance: institutionBalance + currentBalance,
            groups: {
              ...existingInstitutionData.groups,
              [groupId]: {
                ...existingAccountGroupData,
                balance: accountGroupData.balance + currentBalance,
                accountIds: [...accountGroupData.accountIds, id]
              }
            }
          }
        }
      }, {})

    // But now the institutions are not sorted and we lost existing institution data
    const payload = Object.keys(groupedAccountIds)
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

    dispatch({ type: types.UPDATE_GROUPS_BY_INSTITUTION, payload })
  }
}
