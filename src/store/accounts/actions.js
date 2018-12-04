import uuid from 'uuid/v4'
import types from './types'
import { saveState } from '../user/actions'

export const loadAccounts = (accounts) => {
  return { type: types.LOAD_ACCOUNTS, payload: accounts }
}

export const afterAccountsChanged = async () => {
  // await dispatch(updatePortfolioFilters())
  await saveState()
}

export const createAccount = (account) => {
  return (dispatch) => {
    dispatch({ type: types.CREATE_ACCOUNT, payload: { ...account, id: uuid() } })
    return afterAccountsChanged(dispatch)
  }
}

export const updateAccount = (account) => {
  return async (dispatch) => {
    dispatch({ type: types.UPDATE_ACCOUNT, payload: account })
    return afterAccountsChanged(dispatch)
  }
}

export const deleteAccount = (accountId) => {
  return (dispatch) => {
    dispatch({ type: types.DELETE_ACCOUNT, payload: accountId })
    return afterAccountsChanged(dispatch)
  }
}
