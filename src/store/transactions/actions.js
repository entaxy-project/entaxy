/* eslint-disable import/prefer-default-export */
import types from './types'

export const addTransaction = (transaction) => {
  return { type: types.ADD_TRANSACTION, payload: transaction }
}
