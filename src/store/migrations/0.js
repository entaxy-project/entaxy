// Add accountType to accounts
export default (state) => {
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
}
