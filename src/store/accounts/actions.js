/* eslint-disable no-console */
import uuid from 'uuid/v4'
import types from './types'
import { saveState } from '../user/actions'
import { showOverlay, hideOverlay } from '../settings/actions'
import {
  addTransactions,
  deleteTransactions,
  getAccountTransactions
} from '../transactions/actions'

export const loadAccounts = accounts => ({
  type: types.LOAD_ACCOUNTS, payload: accounts
})

export const afterAccountsChanged = () => (dispatch) => {
  dispatch({ type: types.GROUP_BY_INSTITUTION })
  saveState()
}

export const calculateCurrentBalance = (account, transactions = []) => (
  transactions.reduce((balance, transaction) => {
    if (transaction.createdAt > account.openingBalanceDate) {
      return balance + transaction.amount
    }
    return balance
  }, account.openingBalance)
)

export const createAccount = account => (dispatch) => {
  const newAccount = {
    ...account,
    groupId: account.groupId || '0',
    currentBalance: account.openingBalance,
    id: uuid()
  }
  dispatch({ type: types.CREATE_ACCOUNT, payload: newAccount })
  dispatch(afterAccountsChanged())
  return newAccount.id
}

export const updateAccount = account => (dispatch, getState) => {
  const transactions = getAccountTransactions(account.id, getState().transactions.list)
  const currentBalance = calculateCurrentBalance(account, transactions)

  dispatch({ type: types.UPDATE_ACCOUNT, payload: { ...account, currentBalance } })
  dispatch(afterAccountsChanged())
}

export const updateAccountBalance = account => (dispatch, getState) => {
  const transactions = getAccountTransactions(account.id, getState().transactions.list)
  const currentBalance = calculateCurrentBalance(account, transactions)

  dispatch({ type: types.UPDATE_ACCOUNT, payload: { ...account, currentBalance } })
}

export const deleteAccount = (account, options = { skipAfterChange: false }) => {
  const { skipAfterChange } = options
  return (dispatch, getState) => {
    const transactionIds = getState().transactions.list
      .filter(transaction => transaction.accountId === account.id)
      .map(transaction => transaction.id)

    dispatch(deleteTransactions(account, transactionIds, { skipAfterChange: true }))
    dispatch({ type: types.DELETE_ACCOUNT, payload: account.id })
    if (!skipAfterChange) {
      dispatch(afterAccountsChanged())
    }
  }
}

export const createAccountWithTransactions = (dispatch, account, transactions) => {
  const newAccount = {
    ...account,
    groupId: account.groupId || '0',
    currentBalance: calculateCurrentBalance(account, transactions),
    id: uuid()
  }
  const newTransactions = transactions.map(transaction => ({
    ...transaction,
    id: uuid(),
    accountId: newAccount.id
  }))

  dispatch({ type: types.CREATE_ACCOUNT, payload: newAccount })
  dispatch(addTransactions(newAccount, newTransactions, { skipAfterChange: true }))
  return newAccount.id
}

export const createAccountGroup = (institution, accountGroupData, importedAccounts) => {
  return (dispatch) => {
    dispatch(showOverlay(`Importing data from ${institution} ...`))
    const accountGroupId = uuid()

    const accountIds = importedAccounts.map((importedAccount) => {
      const { transactions, ...newAccount } = importedAccount
      newAccount.institution = institution
      newAccount.groupId = accountGroupId
      return createAccountWithTransactions(dispatch, newAccount, transactions)
    })

    // Create the account group
    const accountGroup = {
      ...accountGroupData,
      accountIds,
      id: accountGroupId,
      type: 'api'
    }

    dispatch({ type: types.CREATE_ACCOUNT_GROUP, payload: { institution, accountGroup } })
    saveState()
    dispatch(hideOverlay())
  }
}

export const updateAccountGroup = (institution, accountGroup, importedAccounts) => {
  return async (dispatch, getState) => {
    dispatch(showOverlay(`Importing data from ${institution} ...`))

    const existingAccounts = []
    importedAccounts.map((importedAccount) => {
      // Find existing account
      const account = Object.values(getState().accounts.byId)
        .find(acc => acc.sourceId === importedAccount.sourceId)

      if (account) {
        existingAccounts.push(account)
        // TODO: add new transactions + check for duplicates
      } else {
        const { transactions, ...newAccount } = importedAccount
        newAccount.institution = institution
        newAccount.groupId = accountGroup.id
        return createAccountWithTransactions(dispatch, newAccount, transactions)
      }
      return null
    })
    return dispatch(hideOverlay())
  }
}

export const deleteAccountGroup = (accountGroup) => {
  return (dispatch, getState) => {
    Object.values(accountGroup.accountIds).map((accountId) => {
      return dispatch(deleteAccount(getState().accounts.byId[accountId], { skipAfterChange: true }))
    })
    dispatch(afterAccountsChanged())
  }
}
