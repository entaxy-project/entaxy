/* eslint-disable import/prefer-default-export */
import types from './types'
import { resetExchangeRates, updateCurrencies } from '../exchangeRates/actions'
import { convertAccountsAndTransactionsToLocalCurrency, aggregateAccounts } from '../accounts/actions'

export const updateSettings = (settings) => async (dispatch, getState) => {
  const { currency } = getState().settings

  dispatch({ type: types.UPDATE_SETTINGS, payload: settings })
  if (settings.currency !== currency) {
    dispatch(resetExchangeRates())
    await dispatch(updateCurrencies())
    dispatch(convertAccountsAndTransactionsToLocalCurrency())
    await dispatch(aggregateAccounts())
  }
}
