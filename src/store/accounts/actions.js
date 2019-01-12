/* eslint-disable no-console */
import uuid from 'uuid/v4'
import types from './types'
import { saveState } from '../user/actions'
import { showOverlay, hideOverlay } from '../settings/actions'
import { calculateCurrentBalance, groupByInstitution } from './aggregations'
import {
  addTransactions,
  deleteTransactions,
  getAccountTransactions
} from '../transactions/actions'

export const loadAccounts = (accounts) => {
  return { type: types.LOAD_ACCOUNTS, payload: accounts }
}

export const afterAccountsChanged = async (dispatch) => {
  await dispatch(groupByInstitution())
  saveState()
}

export const createAccount = (account) => {
  return async (dispatch) => {
    const newAccount = {
      ...account,
      groupId: account.groupId || '0',
      currentBalance: calculateCurrentBalance(account),
      id: uuid()
    }
    dispatch({ type: types.CREATE_ACCOUNT, payload: newAccount })
    await afterAccountsChanged(dispatch)
    return newAccount.id
  }
}

export const updateAccount = (account) => {
  return (dispatch, getState) => {
    const transactions = getAccountTransactions(account.id, getState().transactions.list)
    const currentBalance = calculateCurrentBalance(account, transactions)
    dispatch({ type: types.UPDATE_ACCOUNT, payload: { ...account, currentBalance } })
    afterAccountsChanged(dispatch)
  }
}

export const updateAccountBalance = (account) => {
  return (dispatch, getState) => {
    const transactions = getAccountTransactions(account.id, getState().transactions.list)
    const currentBalance = calculateCurrentBalance(account, transactions)
    dispatch({ type: types.UPDATE_ACCOUNT, payload: { ...account, currentBalance } })
  }
}

export const deleteAccount = (account, options = { skipAfterChange: false }) => {
  const { skipAfterChange } = options
  return (dispatch, getState) => {
    const transactionIds = getState().transactions.list
      .filter(transaction => (
        transaction.accountId === account.id
      ))
      .map(transaction => transaction.id)

    dispatch(deleteTransactions(account, transactionIds, { skipAfterChange: true }))
    dispatch({ type: types.DELETE_ACCOUNT, payload: account.id })
    if (!skipAfterChange) {
      afterAccountsChanged(dispatch)
    }
  }
}

export const createAccountWithTransactions = async (dispatch, account, transactions) => {
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

  await dispatch({ type: types.CREATE_ACCOUNT, payload: newAccount })
  await dispatch(addTransactions(newAccount, newTransactions, { skipAfterChange: true }))
  return newAccount.id
}

export const createAccountGroup = (institution, accountGroupData, importedAccounts) => {
  return async (dispatch) => {
    dispatch(showOverlay(`Importing data from ${institution} ...`))
    const accountGroupId = uuid()

    const accountIds = await Promise.all(await importedAccounts.map(async (importedAccount) => {
      const { transactions, ...newAccount } = importedAccount
      newAccount.institution = institution
      newAccount.groupId = accountGroupId
      return createAccountWithTransactions(dispatch, newAccount, transactions)
    }))

    // Create the account group
    const accountGroup = {
      ...accountGroupData,
      accountIds,
      id: accountGroupId,
      type: 'api'
    }

    await dispatch({ type: types.CREATE_ACCOUNT_GROUP, payload: { institution, accountGroup } })
    await saveState()
    dispatch(hideOverlay())
  }
}

export const updateAccountGroup = (institution, accountGroup, importedAccounts) => {
  return async (dispatch, getState) => {
    dispatch(showOverlay(`Importing data from ${institution} ...`))

    const existingAccounts = []
    await Promise.all(importedAccounts.map(async (importedAccount) => {
      // Find existing account
      const account = Object.values(getState().accounts.byId)
        .find(acc => acc.sourceId === importedAccount.sourceId)

      if (account) {
        existingAccounts.push(account)
        // TODO: add new transactions
      } else {
        const { transactions, ...newAccount } = importedAccount
        newAccount.institution = institution
        newAccount.groupId = accountGroup.id
        return createAccountWithTransactions(dispatch, newAccount, transactions)
      }
      return null
    }))
    return dispatch(hideOverlay())
  }
}

export const deleteAccountGroup = (accountGroup) => {
  return async (dispatch, getState) => {
    Object.values(accountGroup.accountIds).map((accountId) => {
      return dispatch(deleteAccount(getState.accounts[accountId], { skipAfterChange: true }))
    })
    afterAccountsChanged(dispatch)
  }
}
