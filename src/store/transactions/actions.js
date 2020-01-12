/* eslint-disable import/no-cycle */
import uuid from 'uuid/v4'
import pluralize from 'pluralize'
import types from './types'
import { updateAccount } from '../accounts/actions'
import { showSnackbar } from '../user/actions'
import { updateCurrencies, convertToCurrency } from '../exchangeRates/actions'
import {
  createRule,
  updateRule,
  deleteRule,
  applyRule
} from '../budget/actions'

export const createTransaction = (account, transaction, {
  rule = null,
  applyToExisting = false,
  applyToFuture = false
} = {}) => (
  async (dispatch) => {
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

    if (rule && rule.attributes && Object.keys(rule.attributes).length > 0) {
      let newRule = rule
      if (applyToFuture) {
        const ruleId = dispatch(createRule(rule))
        newRule = { ...rule, id: ruleId }
      }
      if (applyToExisting) dispatch(applyRule(newRule))
    }

    await dispatch(updateAccount(account, { onlyUpdateBalance: true }))
    dispatch(showSnackbar({ text: 'Transaction created', status: 'success' }))
    return id
  }
)

export const updateTransaction = (account, transaction, {
  rule = null,
  applyToExisting = false,
  applyToFuture = false
} = {}) => (
  async (dispatch, getState) => {
    const { transactions, budget } = getState()
    const oldTransaction = transactions.list.find((t) => t.id === transaction.id)
    let { localCurrency } = transaction.amount
    const amountChanged = transaction.amount.accountCurrency !== oldTransaction.amount.accountCurrency
    const createdAtChanged = transaction.createdAt !== oldTransaction.createdAt
    // const descriptionChanged = transaction.description !== oldTransaction.description
    // const categoryChanged = transaction.categoryId !== oldTransaction.categoryId
    // const transferAccountIdChanged = transaction.transferAccountId !== oldTransaction.transferAccountId
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

    if (rule && rule.attributes) {
      if (Object.keys(rule.attributes).length > 0) {
        if (oldTransaction.ruleId) {
          // Update existing rule
          if (applyToFuture) dispatch(updateRule({ ...rule, id: oldTransaction.ruleId }))
          if (applyToExisting) {
            dispatch(applyRule({ ...rule, id: applyToFuture ? oldTransaction.ruleId : null }))
          }
        } else {
          // Create new rule
          let newRule = rule
          if (applyToFuture) {
            const ruleId = dispatch(createRule(rule))
            newRule = { ...rule, id: ruleId }
          }
          if (applyToExisting) dispatch(applyRule(newRule))
        }
      } else if (Object.keys(rule.attributes).length === 0) {
        if (oldTransaction.ruleId) {
          // Delete existing rule
          const deletedRule = budget.rules[oldTransaction.ruleId]
          if (applyToFuture) dispatch(deleteRule(oldTransaction.ruleId))
          if (applyToExisting) dispatch(applyRule(deletedRule, { clearAttributes: applyToFuture }))
        // Apply empty rule to clear the attributes from any matching transaction
        } else if (applyToExisting) {
          dispatch(applyRule(rule))
        }
      }
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
