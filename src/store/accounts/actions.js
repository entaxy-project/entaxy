/* eslint-disable import/no-cycle */
import uuid from 'uuid/v4'
import Big from 'big.js'
import { startOfYesterday } from 'date-fns'
import types from './types'
import { showSnackbar } from '../user/actions'
import {
  addTransactions,
  deleteTransactions,
  getAccountTransactions,
  updateTransactions
} from '../transactions/actions'
import {
  updateCurrencies,
  convertToCurrency
} from '../exchangeRates/actions'

export const loadAccounts = (accounts) => ({
  type: types.LOAD_ACCOUNTS, payload: accounts
})

export const calculateBalance = (account, transactions) => (dispatch) => {
  const total = (transactions || dispatch(getAccountTransactions(account.id)))
    .reduce((balance, transaction) => {
      if (transaction.createdAt >= account.openingBalanceDate) {
        return balance.add(Big(transaction.amount.accountCurrency))
      }
      return balance
    }, Big(account.openingBalance))
  const totalBalance = parseFloat(total)
  return {
    accountCurrency: totalBalance,
    localCurrency: dispatch(convertToCurrency(
      totalBalance,
      account.currency,
      startOfYesterday()
    ))
  }
}

export const convertAccountsAndTransactionsToLocalCurrency = (forceAccounts = null) => (
  (dispatch, getState) => {
    const accounts = forceAccounts || Object.values(getState().accounts.byId)
    accounts.forEach((account) => {
      dispatch({
        type: types.UPDATE_ACCOUNT,
        payload: {
          ...account,
          currentBalance: {
            ...account.currentBalance,
            localCurrency: dispatch(convertToCurrency(
              account.currentBalance.accountCurrency,
              account.currency,
              startOfYesterday()
            ))
          }
        }
      })
    })

    const accountIds = accounts.map((account) => account.id)
    const changes = getState().transactions.list.reduce((result, transaction) => {
      if (forceAccounts && !accountIds.includes(transaction.accountId)) {
        return result
      }
      return {
        ...result,
        [transaction.id]: {
          amount: {
            ...transaction.amount,
            localCurrency: dispatch(convertToCurrency(
              transaction.amount.accountCurrency,
              getState().accounts.byId[transaction.accountId].currency,
              transaction.createdAt
            ))
          }
        }
      }
    }, {})
    dispatch(updateTransactions(changes))
  }
)

// Called after a single account changed
export const aggregateAccounts = () => (dispatch) => {
  dispatch({ type: types.GROUP_BY_INSTITUTION })
}

export const openingBalanceChanged = (oldAccount, newAccount) => (
  ['openingBalance', 'openingBalanceDate'].reduce((res, attr) => (
    res || oldAccount[attr] !== newAccount[attr]
  ), false)
)

// --- CREATE ---
export const createAccount = (account, transactions = []) => (
  async (dispatch) => {
    let currentBalance = dispatch(calculateBalance(account, transactions))

    // If we couldn't convert to local currency it's because we don't have the exchange rate
    // But skip this step if we have transactions to add - it will be done later by the caller
    if (!currentBalance.localCurrency && transactions.length === 0) {
      await dispatch(updateCurrencies({
        forceStarDates: { [account.currency]: account.openingBalanceDate }
      }))
      currentBalance = dispatch(calculateBalance(account, transactions))
    }
    const newAccount = {
      ...account,
      id: uuid(),
      groupId: account.groupId || '0',
      currentBalance
    }
    dispatch({ type: types.CREATE_ACCOUNT, payload: newAccount })

    // Transactions are passed in when creating a account groups (1 or more accounts + transactions)
    // so we just want to add them and leave
    if (transactions.length > 0) {
      await dispatch(addTransactions(newAccount, transactions, { updateAccountAndExchangeRates: false }))
    } else {
      dispatch(aggregateAccounts())
      dispatch(showSnackbar({ text: 'Account created', status: 'success' }))
    }
    return Promise.resolve(newAccount.id)
  }
)

// --- UPDATE ---
export const updateAccount = (account, { onlyUpdateBalance = false } = {}) => (
  async (dispatch, getState) => {
    const oldAccount = getState().accounts.byId[account.id]
    const currencyChanged = oldAccount.currency !== account.currency
    const payload = account
    if (currencyChanged) {
      const oldestTransactionDate = getState().transactions.list.sort(
        (a, b) => a.createdAt - b.createdAt
      )[0].createdAt
      await dispatch(updateCurrencies({
        excludeAccountId: account.id, // delete the old currency if needed
        forceStarDates: { [account.currency]: Math.min(account.openingBalanceDate, oldestTransactionDate) }
      }))
      dispatch(convertAccountsAndTransactionsToLocalCurrency([account]))
    } else {
      if (onlyUpdateBalance || openingBalanceChanged(oldAccount, account)) {
        payload.currentBalance = dispatch(calculateBalance(account))
      }
      dispatch({ type: types.UPDATE_ACCOUNT, payload: account })
    }
    dispatch(aggregateAccounts())
    if (!onlyUpdateBalance) {
      dispatch(showSnackbar({ text: 'Account updated', status: 'success' }))
    }
  }
)

// --- DELETE ---
export const deleteAccount = (account, { skipAfterChange = false } = {}) => {
  return async (dispatch) => {
    const transactionIds = dispatch(getAccountTransactions(account.id)).map((transaction) => transaction.id)

    dispatch(deleteTransactions(account, transactionIds, { skipAfterChange: true }))
    dispatch({ type: types.DELETE_ACCOUNT, payload: account.id })
    if (!skipAfterChange) {
      await dispatch(updateCurrencies())
      dispatch(aggregateAccounts())
      dispatch(showSnackbar({ text: 'Account deleted', status: 'success' }))
    }
  }
}

export const createAccountGroup = (institution, accountGroupData, importedAccounts) => {
  return async (dispatch) => {
    const accountGroupId = uuid()

    // Create the accounts and transactions
    const newAccounts = await Promise.all(importedAccounts.map(async (importedAccount) => {
      const { transactions, ...newAccount } = importedAccount
      newAccount.institution = institution
      newAccount.groupId = accountGroupId
      newAccount.id = await dispatch(createAccount(newAccount, transactions))
      return Promise.resolve(newAccount)
    }))

    // Create the account group
    const accountGroup = {
      ...accountGroupData,
      accountIds: newAccounts.map((account) => account.id),
      id: accountGroupId,
      type: 'api'
    }
    dispatch({ type: types.CREATE_ACCOUNT_GROUP, payload: { institution, accountGroup } })
    await dispatch(updateCurrencies())
    dispatch(convertAccountsAndTransactionsToLocalCurrency(newAccounts))
    dispatch(aggregateAccounts())
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
    await dispatch(updateCurrencies()) // To delete unused currencies
    dispatch(aggregateAccounts())
    dispatch(showSnackbar({ text: 'Account group deleted', status: 'success' }))
  }
}
