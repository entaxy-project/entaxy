import uuid from 'uuid/v4'
import types from './types'
import { saveState } from '../user/actions'

export const loadAccounts = (accounts) => {
  return { type: types.LOAD_ACCOUNTS, payload: accounts }
}

export const afterAccountsChanged = async () => {
  await saveState()
}

export const createAccount = (account) => {
  return async (dispatch) => {
    const newAccount = {
      ...account,
      currentBalance: account.openingBalance,
      id: uuid()
    }
    dispatch({ type: types.CREATE_ACCOUNT, payload: newAccount })
    await afterAccountsChanged(dispatch)
    return newAccount.id
  }
}

export const updateAccount = (account) => {
  return (dispatch, getState) => {
    // Update current balance
    const currentBalance = getState().transactions.list.reduce((balance, transaction) => {
      if (transaction.accountId === account.id && transaction.createdAt > account.openingBalanceDate) {
        return balance + transaction.amount
      }
      return balance
    }, account.openingBalance)

    dispatch({ type: types.UPDATE_ACCOUNT, payload: { ...account, currentBalance } })
    return afterAccountsChanged(dispatch)
  }
}

export const deleteAccount = (accountId) => {
  return (dispatch) => {
    dispatch({ type: types.DELETE_ACCOUNT, payload: accountId })
    return afterAccountsChanged(dispatch)
  }
}
