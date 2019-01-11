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
  console.log('groupByInstitution')
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
        const institutionGroups = institutionData.groups
        const institutionGroupData = institutionGroups[groupId] || {
          id: groupId,
          type: 'default',
          balance: 0,
          accountIds: []
        }
        return {
          ...result,
          [institution]: {
            ...institutionData,
            balance: institutionBalance + currentBalance,
            groups: {
              ...institutionGroups,
              [groupId]: {
                ...institutionGroupData,
                balance: institutionGroupData.balance + currentBalance,
                accountIds: [...institutionGroupData.accountIds, id]
              }
            }
          }
        }
      }, {})
    console.log('groupedAccountIds', groupedAccountIds)

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

    console.log('groupByInstitution', payload)
    dispatch({ type: types.UPDATE_GROUP_BY_INSTITUTION, payload })
  }
}

// export const groupByInstitution = () => {
//   console.log('groupByInstitution')
//   return (dispatch, getState) => {
//     const { byId, byInstitution } = getState().accounts
//     // Group sorted accounts by institution
//     // results in something like:
//     // {
//     //   TD: {accountIds: [id1, id2], balance: 100},
//     //   BMO: {accountIds: [id3], balance: 200}
//     // }
//     const groupedAccountIds = Object.values(byId)
//       // Sort accounts by name
//       .sort((a, b) => (a.name > b.name))
//       // Group them by institution
//       .reduce((result, account) => {
//         const { id, institution, currentBalance } = account
//         const institutionData = result[institution] || {}
//         const institutionAccountIds = institutionData.accountIds || []
//         const institutionBalance = institutionData.balance || 0
//         return {
//           ...result,
//           [institution]: {
//             ...institutionData,
//             accountIds: [...institutionAccountIds, id],
//             balance: institutionBalance + currentBalance
//           }
//         }
//       }, {})
//     console.log('groupedAccountIds', groupedAccountIds)

//     // But now the institutions are not sorted and we lost existing institution data
//     const payload = Object.keys(groupedAccountIds)
//       // Sort institutions by name
//       .sort((a, b) => (a > b))
//       // Merge new sorted institutions with existing institution data
//       .reduce((result, institution) => ({
//         ...result,
//         [institution]: {
//           ...byInstitution[institution],
//           ...groupedAccountIds[institution]
//         }
//       }), {})

//     console.log('groupByInstitution', payload)
//     dispatch({ type: types.UPDATE_GROUP_BY_INSTITUTION, payload })
//   }
// }
