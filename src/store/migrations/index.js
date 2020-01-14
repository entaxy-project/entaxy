import uuid from 'uuid/v4'

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
  // 3: (state) => {
  //   if (!state.budget) return state
  //   // collect accountIds
  //   state.transactions.list.forEach((transaction) => {
  //     if (transaction.categoryId === categoryId) {

  //     }
  //   })

  //   return {
  //     ...state,
  //     budget: {
  //       ...state.budget,
  //       rules: Object.keys(state.budget.rules).reduce((res, match) => {
  //         const ruleId = uuid()
  //         const { categoryId } = state.budget.rules[match]
  //         return {
  //           id: ruleId,
  //           accountId: account.id,
  //           attributes: { categoryId },
  //           filterBy: { description: { type: 'equals', value: match } }
  //         }
  //       })
  //     },
  //     exchangeRates: Object.keys(state.exchangeRates).reduce((result, currency) => {
  //       const { dates, ...exchangeRates } = state.exchangeRates[currency]
  //       return {
  //         ...result,
  //         [currency]: exchangeRates
  //       }
  //     }, {})
  //   }
  // }
}

export default migrations
