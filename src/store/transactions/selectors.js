/* eslint-disable import/prefer-default-export */
import { createSelector } from 'reselect'

const getTransactions = state => state.transactions

export const subtotalSelector = createSelector(
  getTransactions,
  transactions => transactions.reduce((acc, transaction) => acc + transaction.price, 0)
)

export const portfolioSelector = createSelector(
  getTransactions,
  transactions => transactions.reduce((acc, transaction) => acc + transaction.price, 0)
)

