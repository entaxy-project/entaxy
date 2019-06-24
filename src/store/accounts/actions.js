/* eslint-disable import/no-cycle */
import uuid from 'uuid/v4'
import Big from 'big.js'
import types from './types'
import { saveState } from '../user/actions'
import {
  addTransactions,
  deleteTransactions,
  getAccountTransactions
} from '../transactions/actions'
import {
  currencyExists,
  updateCurrencies,
  convertToLocalCurrency
} from '../exchangeRates/actions'

export const loadAccounts = accounts => ({
  type: types.LOAD_ACCOUNTS, payload: accounts
})

export const calculateBalance = (state, account, transactions = []) => {
  console.log('calculateBalance', transactions, state)
  const total = transactions.reduce((balance, transaction) => {
    if (transaction.createdAt > account.openingBalanceDate) {
      return balance.add(Big(transaction.amount))
    }
    return balance
  }, Big(account.openingBalance))
  const totalBalance = parseFloat(total)
  const localCurrency = convertToLocalCurrency(state, totalBalance, account.currency)
  console.log('accountCurrency', totalBalance)
  console.log('localCurrency', localCurrency)
  return {
    accountCurrency: totalBalance,
    localCurrency
  }
}

export const afterAccountsChanged = () => (dispatch) => {
  dispatch({ type: types.GROUP_BY_INSTITUTION })
  saveState()
}

export const openingBalanceChanged = (oldAccount, newAccount) => (
  ['openingBalance', 'openingBalanceDate'].reduce((res, attr) => (
    res || oldAccount[attr] !== newAccount[attr]
  ), false)
)

export const valueHasChanged = (attr, oldAccount, newAccount) => (
  oldAccount[attr] !== newAccount[attr]
)

// --- CREATE ---
export const createAccount = (account, transactions = []) => async (dispatch, getState) => {
  if (!currencyExists(account.currency)) {
    await updateCurrencies()
  }

  const newAccount = {
    ...account,
    id: uuid(),
    groupId: account.groupId || '0',
    currentBalance: await calculateBalance(getState, account, transactions)
  }
  dispatch({ type: types.CREATE_ACCOUNT, payload: newAccount })

  if (transactions.length > 0) {
    dispatch(addTransactions(newAccount, transactions, { skipAfterChange: true }))
  }
  dispatch(afterAccountsChanged(account))
  return newAccount.id
}

// --- UPDATE ---
export const updateAccount = (account, options = { forceUpdateBalance: false }) => (
  async (dispatch, getState) => {
    const { forceUpdateBalance } = options
    const oldAccount = getState().accounts.byId[account.id]
    const payload = account

    if (forceUpdateBalance || openingBalanceChanged(oldAccount, account)) {
      const transactions = getAccountTransactions(getState(), account.id)
      payload.currentBalance = calculateBalance(getState(), account, transactions)
    }
    dispatch({ type: types.UPDATE_ACCOUNT, payload })
    await dispatch(afterAccountsChanged())
  }
)

// --- DELETE ---
export const deleteAccount = (account, options = { skipAfterChange: false }) => (_, getState) => {
  const { skipAfterChange } = options
  return (dispatch) => {
    const transactionIds = getAccountTransactions(getState(), account.id).map(transaction => transaction.id)

    dispatch(deleteTransactions(account, transactionIds, { skipAfterChange: true }))
    dispatch({ type: types.DELETE_ACCOUNT, payload: account.id })
    if (!skipAfterChange) {
      dispatch(afterAccountsChanged())
    }
  }
}

export const createAccountGroup = (institution, accountGroupData, importedAccounts) => {
  return (dispatch) => {
    const accountGroupId = uuid()

    const accountIds = importedAccounts.map((importedAccount) => {
      const { transactions, ...newAccount } = importedAccount
      newAccount.institution = institution
      newAccount.groupId = accountGroupId
      return dispatch(createAccount(newAccount, transactions))
    })

    // Create the account group
    const accountGroup = {
      ...accountGroupData,
      accountIds,
      id: accountGroupId,
      type: 'api'
    }

    dispatch({ type: types.CREATE_ACCOUNT_GROUP, payload: { institution, accountGroup } })
    dispatch(afterAccountsChanged())
  }
}

export const updateAccountGroup = (institution, accountGroup, importedAccounts) => {
  return async (dispatch, getState) => {
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
        return dispatch(createAccount(newAccount, transactions))
      }
      return null
    })
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
