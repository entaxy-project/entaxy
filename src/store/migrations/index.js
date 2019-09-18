const migrations = {
  0: (state) => {
    if (!state.accounts) return state
    // Add accountType to accounts
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
  }
}

export default migrations
