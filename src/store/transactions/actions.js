/* eslint-disable import/no-cycle */
import uuid from 'uuid/v4'
import pluralize from 'pluralize'
import types from './types'
import { updateAccount } from '../accounts/actions'
import { showSnackbar } from '../user/actions'
import { updateCurrencies, convertToCurrency } from '../exchangeRates/actions'
import { createExactRule, deleteExactRule, countRuleUsage } from '../budget/actions'

// If the rule is not found then the category is cleared from matching transactions
export const applyExactRule = ({ match, rules }) => (
  { type: types.APPLY_EXACT_RULE, payload: { match, rules } }
)

export const createTransaction = (account, transaction, { createAndApplyRule = false } = {}) => (
  async (dispatch, getState) => {
    const { budget } = getState()
    const id = uuid()
    let localCurrency = dispatch(convertToCurrency(
      transaction.amount.accountCurrency,
      account.currency,
      transaction.createdAt
    ))

    // If we couldn't convert to local currency it's because we don't have the exchange rate
    if (!localCurrency) {
      await dispatch(updateCurrencies({
        forceStarDates: { [account.currency]: transaction.createdAt }
      }))
      localCurrency = dispatch(convertToCurrency(
        transaction.amount.accountCurrency,
        account.currency,
        transaction.createdAt
      ))
    }

    dispatch({
      type: types.CREATE_TRANSACTION,
      payload: {
        ...transaction,
        id,
        amount: {
          accountCurrency: transaction.amount.accountCurrency,
          localCurrency
        },
        accountId: account.id,
        createdAt: transaction.createdAt + 1000 // Plus 1 second
      }
    })
    if (transaction.categoryId !== undefined && createAndApplyRule) {
      dispatch(createExactRule(transaction.categoryId, transaction.description))
      dispatch(applyExactRule({ match: transaction.description, rules: budget.rules }))
      dispatch(countRuleUsage())
    }

    await dispatch(updateAccount(account, { onlyUpdateBalance: true }))
    dispatch(showSnackbar({ text: 'Transaction created', status: 'success' }))
    return id
  }
)

export const updateTransaction = (account, transaction, { createAndApplyRule = false } = {}) => (
  async (dispatch, getState) => {
    const { transactions } = getState()
    const oldTransaction = transactions.list.find((t) => t.id === transaction.id)
    let { localCurrency } = transaction.amount
    const amountChanged = transaction.amount.accountCurrency !== oldTransaction.amount.accountCurrency
    const createdAtChanged = transaction.createdAt !== oldTransaction.createdAt
    const categoryChanged = transaction.categoryId !== oldTransaction.categoryId
    const descriptionChanged = transaction.description !== oldTransaction.description
    if (amountChanged || createdAtChanged) {
      localCurrency = dispatch(convertToCurrency(
        transaction.amount.accountCurrency,
        account.currency,
        transaction.createdAt
      ))

      // If we couldn't convert to local currency it's because we don't have the exchange rate
      if (!localCurrency) {
        await dispatch(updateCurrencies({
          forceStarDates: { [account.currency]: transaction.createdAt }
        }))
        localCurrency = dispatch(convertToCurrency(
          transaction.amount.accountCurrency,
          account.currency,
          transaction.createdAt
        ))
      }
    }
    dispatch({
      type: types.UPDATE_TRANSACTION,
      payload: {
        ...transaction,
        amount: {
          accountCurrency: transaction.amount.accountCurrency,
          localCurrency
        },
        createdAt: createdAtChanged ? transaction.createdAt + 1000 : transaction.createdAt // plus 1 second
      }
    })
    if (categoryChanged || descriptionChanged) {
      if (createAndApplyRule) {
        if (transaction.categoryId === undefined) {
          dispatch(deleteExactRule(transaction.description))
        } else {
          dispatch(createExactRule(transaction.categoryId, transaction.description))
        }
        dispatch(applyExactRule({ match: transaction.description, rules: getState().budget.rules }))
      }
      dispatch(countRuleUsage())
    }
    if (amountChanged || createdAtChanged) {
      await dispatch(updateAccount(account, { onlyUpdateBalance: true }))
    }
    dispatch(showSnackbar({ text: 'Transaction updated', status: 'success' }))
  }
)

// changes has the format { id1: transaction1,  id2: transaction2, ... }
export const updateTransactions = (changes) => (
  { type: types.UPDATE_TRANSACTIONS, payload: changes }
)

export const updateTransactionFieldIfMatched = ({ fieldName, values, newValue }) => (
  { type: types.UPATE_TRANSACTION_FIELD_IF_MATCHED, payload: { fieldName, values, newValue } }
)

export const deleteTransactions = (account, transactionIds, { skipAfterChange = false } = {}) => (
  async (dispatch) => {
    dispatch({ type: types.DELETE_TRANSACTIONS, payload: transactionIds })
    dispatch(countRuleUsage())
    if (!skipAfterChange) {
      await dispatch(updateAccount(account, { onlyUpdateBalance: true }))
      dispatch(showSnackbar({
        text: `${pluralize('transaction', transactionIds.length, true)} deleted`,
        status: 'success'
      }))
    }
  }
)

// Load all the transactions from storage
// Replaces existing transactions
export const loadTransactions = (transactions) => {
  return { type: types.LOAD_TRANSACTIONS, payload: transactions }
}

// Add new transactions to the existing ones
export const addTransactions = (account, transactions, { updateAccountAndExchangeRates = true } = {}) => (
  async (dispatch, getState) => {
    if (updateAccountAndExchangeRates) {
      const { settings, exchangeRates } = getState()
      if (account.currency !== settings.currency) {
        const oldestTransactionDate = transactions.sort((a, b) => a.createdAt - b.createdAt)[0].createdAt
        const oldestExchangeRateDate = Object.keys(exchangeRates[account.currency]).sort((a, b) => a - b)[0]
        if (oldestTransactionDate < oldestExchangeRateDate) {
          await dispatch(updateCurrencies({
            forceStarDates: { [account.currency]: oldestTransactionDate }
          }))
        }
      }
    }
    // Note: transactions only have date (no time) associated so we save them 1 second
    // ahead so thart the opening balance is always the first transactions of the day
    dispatch({
      type: types.ADD_TRANSACTIONS,
      payload: transactions.map((transaction) => Object.assign((transaction), {
        id: uuid(),
        accountId: account.id,
        createdAt: transaction.createdAt + 1000, // Plus 1 second
        amount: {
          ...transaction.amount,
          localCurrency: dispatch(convertToCurrency(
            transaction.amount.accountCurrency,
            account.currency,
            transaction.createdAt
          ))
        }
      }))
    })
    dispatch(countRuleUsage())
    if (updateAccountAndExchangeRates) {
      await dispatch(updateAccount(account, { onlyUpdateBalance: true }))
    }
  }
)

export const getAccountTransactions = (accountId) => (_, getState) => (
  getState().transactions.list.filter((transaction) => transaction.accountId === accountId)
)

export const filterByErrors = (transaction) => (
  Object.keys(transaction).includes('errors') && transaction.errors.length > 0
)

export const filterByDuplicates = (transaction) => (
  Object.keys(transaction).includes('duplicate')
)
