/* eslint-disable import/no-cycle */
import uuid from 'uuid/v4'
import Big from 'big.js'
import types from './types'
import { showSnackbar } from '../settings/actions'
import {
  addTransactions,
  deleteTransactions,
  getAccountTransactions
} from '../transactions/actions'
import {
  updateCurrencies,
  convertToLocalCurrency
} from '../exchangeRates/actions'

export const loadAccounts = (accounts) => ({
  type: types.LOAD_ACCOUNTS, payload: accounts
})

export const calculateBalance = (state, account, transactions = []) => {
  const total = transactions.reduce((balance, transaction) => {
    if (transaction.createdAt >= account.openingBalanceDate) {
      return balance.add(Big(transaction.amount))
    }
    return balance
  }, Big(account.openingBalance))
  const totalBalance = parseFloat(total)
  return {
    accountCurrency: totalBalance,
    localCurrency: convertToLocalCurrency(state, totalBalance, account.currency)
  }
}

// Convert account balances to local currency
export const convertAccountsBalancesToLocalCurrency = (dispatch, getState) => {
  Object.keys(getState().accounts.byId).forEach((accountId) => {
    const account = getState().accounts.byId[accountId]
    if (account.currency !== getState().settings.currency) {
      dispatch({
        type: types.UPDATE_ACCOUNT,
        payload: {
          ...account,
          currentBalance: {
            ...account.currentBalance,
            localCurrency: convertToLocalCurrency(getState(), account.currentBalance.accountCurrency, account.currency)
          }
        }
      })
    }
  })
}

export const afterAccountsChanged = () => async (dispatch, getState) => {
  await dispatch(updateCurrencies(dispatch, getState()))
  convertAccountsBalancesToLocalCurrency(dispatch, getState)
  dispatch({ type: types.GROUP_BY_INSTITUTION })
}

export const openingBalanceChanged = (oldAccount, newAccount) => (
  ['openingBalance', 'openingBalanceDate'].reduce((res, attr) => (
    res || oldAccount[attr] !== newAccount[attr]
  ), false)
)

// --- CREATE ---
export const createAccount = (account, transactions = [], options = { skipAfterChange: false }) => {
  const { skipAfterChange } = options
  return async (dispatch, getState) => {
    const newAccount = {
      ...account,
      id: uuid(),
      groupId: account.groupId || '0',
      currentBalance: await calculateBalance(getState(), account, transactions)
    }
    dispatch({ type: types.CREATE_ACCOUNT, payload: newAccount })
    if (transactions.length > 0) {
      await dispatch(addTransactions(newAccount, transactions, { skipAfterChange: true }))
    }
    if (!skipAfterChange) {
      await dispatch(afterAccountsChanged())
      dispatch(showSnackbar({ text: 'Account created', status: 'success' }))
    }
    return Promise.resolve(newAccount.id)
  }
}

// --- UPDATE ---
export const updateAccount = (account, options = { forceUpdateBalance: false, showMessage: true }) => (
  async (dispatch, getState) => {
    const { forceUpdateBalance, showMessage } = options
    const oldAccount = getState().accounts.byId[account.id]
    const payload = account

    if (forceUpdateBalance || openingBalanceChanged(oldAccount, account)) {
      const transactions = getAccountTransactions(getState(), account.id)
      payload.currentBalance = await calculateBalance(getState(), account, transactions)
    }
    dispatch({ type: types.UPDATE_ACCOUNT, payload })
    await dispatch(afterAccountsChanged())
    if (showMessage) {
      dispatch(showSnackbar({ text: 'Account updated', status: 'success' }))
    }
  }
)

// --- DELETE ---
export const deleteAccount = (account, options = { skipAfterChange: false }) => {
  return async (dispatch, getState) => {
    const { skipAfterChange } = options
    const transactionIds = getAccountTransactions(getState(), account.id).map((transaction) => transaction.id)

    dispatch(deleteTransactions(account, transactionIds, { skipAfterChange: true }))
    dispatch({ type: types.DELETE_ACCOUNT, payload: account.id })
    if (!skipAfterChange) {
      await dispatch(afterAccountsChanged())
      dispatch(showSnackbar({ text: 'Account deleted', status: 'success' }))
    }
  }
}

export const createAccountGroup = (institution, accountGroupData, importedAccounts) => {
  return async (dispatch) => {
    const accountGroupId = uuid()
    const accountIds = await Promise.all(importedAccounts.map(async (importedAccount) => {
      const { transactions, ...newAccount } = importedAccount
      newAccount.institution = institution
      newAccount.groupId = accountGroupId
      const accountId = await dispatch(createAccount(newAccount, transactions, { skipAfterChange: true }))
      return Promise.resolve(accountId)
    }))

    // Create the account group
    const accountGroup = {
      ...accountGroupData,
      accountIds,
      id: accountGroupId,
      type: 'api'
    }

    dispatch({ type: types.CREATE_ACCOUNT_GROUP, payload: { institution, accountGroup } })
    await dispatch(afterAccountsChanged())
  }
}

export const updateAccountGroup = (institution, accountGroup, importedAccounts) => {
  return async (dispatch, getState) => {
    const existingAccounts = []
    importedAccounts.map((importedAccount) => {
      // Find existing account
      const account = Object.values(getState().accounts.byId)
        .find((acc) => acc.sourceId === importedAccount.sourceId)

      if (account) {
        existingAccounts.push(account)
        // TODO: add new transactions + check for duplicates
      } else {
        const { transactions, ...newAccount } = importedAccount
        newAccount.institution = institution
        newAccount.groupId = accountGroup.id
        return dispatch(createAccount(newAccount, transactions))
      }
      return null
    })
  }
}

export const deleteAccountGroup = (accountGroup) => {
  return async (dispatch, getState) => {
    Promise.all(Object.values(accountGroup.accountIds).map(async (accountId) => {
      await dispatch(deleteAccount(getState().accounts.byId[accountId], { skipAfterChange: true }))
    }))
    await dispatch(afterAccountsChanged())
  }
}
