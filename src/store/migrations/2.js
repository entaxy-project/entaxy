// Update transaction amount
// Remove dates array from exchangeRates
export default (state) => {
  if (!state.transactions) return state
  return {
    ...state,
    transactions: {
      list: state.transactions.list.map((transaction) => ({
        ...transaction,
        amount: { accountCurrency: transaction.amount, localCurrency: null }
      }))
    },
    exchangeRates: Object.keys(state.exchangeRates).reduce((result, currency) => {
      const { dates, ...exchangeRates } = state.exchangeRates[currency]
      return {
        ...result,
        [currency]: exchangeRates
      }
    }, {})
  }
}
