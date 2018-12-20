/* eslint no-console: 0 */
import { createSelector } from 'reselect'

const getAccounts = state => state.accounts
const getInstitutions = () => ([
  'RBC', 'BMO', 'TD', 'Tangerine'
])

export const sortedAccountsGroupedByInstitution = createSelector(
  getAccounts,
  (accounts) => {
    const groupedAccounts = {}
    accounts.sort((a, b) => (a.name > b.name)).forEach((account) => {
      if (!Object.keys(groupedAccounts).includes(account.institution)) {
        groupedAccounts[account.institution] = []
      }
      groupedAccounts[account.institution].push(account)
    })
    return groupedAccounts
  }
)

export const sortedInstitutions = createSelector(
  getInstitutions,
  institutions => institutions.sort((a, b) => (a > b))
)

export const sortedInstitutionsForAutoselect = createSelector(
  sortedInstitutions,
  institutions => institutions.map(institution => ({ label: institution, value: institution }))
)
