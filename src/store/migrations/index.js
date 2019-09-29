const migrations = {
  // Add accountType to accounts
  0: (state) => {
    if (!state.accounts) return state
    return {
      ...state,
      accounts: {
        ...state.accounts,
        byId: Object.values(state.accounts.byId).reduce((result, account) => ({
          ...result,
          [account.id]: { ...account, accountType: 'Bank' }
        }), {})
      }
    }
  },
  // Cleanup settings (remove snackbarMessage)
  1: (state) => {
    if (!state.settings) return state
    return {
      ...state,
      settings: {
        currency: state.settings.currency,
        locale: state.settings.locale
      }
    }
  },
  // Update transaction amount
  // Remove dates array from exchangeRates
  2: (state) => {
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
}

export default migrations
