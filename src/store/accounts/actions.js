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

export const deleteAccount = (account) => {
  return (dispatch, getState) => {
    const transactionIds = getState().transactions.list
      .filter(transaction => (
        transaction.accountId === account.id
      ))
      .map(transaction => transaction.id)

    dispatch(deleteTransactions(account, transactionIds, { skipAfterChange: true }))
    dispatch({ type: types.DELETE_ACCOUNT, payload: account.id })
    afterAccountsChanged(dispatch)
  }
}

export const createAccountGroup = (institution, accountGroupData, accounts) => {
  // Create the account group
  const accountGroup = {
    ...accountGroupData,
    accountIds: [],
    id: uuid(),
    type: 'api'
  }

  return async (dispatch) => {
    dispatch(showOverlay('Importing data from Coinbase ...'))
    await accounts.forEach(async (account) => {
      // Create the account
      const newAccount = {
        ...account,
        institution,
        id: uuid(),
        groupId: accountGroup.id,
        currentBalance: calculateCurrentBalance(account, account.transactions)
      }
      accountGroup.accountIds.push(newAccount.id)
      await dispatch({ type: types.CREATE_ACCOUNT, payload: newAccount })

      // Create the transactions
      const transactions = account.transactions.map(transaction => ({
        ...transaction,
        id: uuid(),
        accountId: newAccount.id
      }))
      dispatch(addTransactions(newAccount, transactions, { skipAfterChange: true }))
    })

    await dispatch({ type: types.CREATE_ACCOUNT_GROUP, payload: { institution, accountGroup } })
    await saveState()
    dispatch(hideOverlay())
  }
}

