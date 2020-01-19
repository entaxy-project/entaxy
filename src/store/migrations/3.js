import uuid from 'uuid/v4'

export default (state) => {
  if (!('budget' in state)) return state
  if (Object.keys(state.budget.rules).length === 0) return state
  const { transactions, budget: { rules } } = state

  const existingRules = {}
  const newRules = {}
  const changes = {}
  transactions.list.forEach((transaction) => {
    if (
      !transaction.ruleId
      && transaction.categoryId
      && transaction.description in rules
      && rules[transaction.description].categoryId === transaction.categoryId
    ) {
      if (!(transaction.description in existingRules)) {
        existingRules[transaction.description] = { }
      }
      if (!(transaction.accountId in existingRules[transaction.description])) {
        existingRules[transaction.description][transaction.accountId] = {
          categoryId: transaction.categoryId,
          transactions: []
        }
      }
      existingRules[transaction.description][transaction.accountId].transactions.push(transaction)
    }
  })

  Object.keys(existingRules).forEach((match) => {
    Object.keys(existingRules[match]).forEach((accountId) => {
      const ruleId = uuid()
      newRules[ruleId] = {
        id: ruleId,
        accountId,
        attributes: { categoryId: existingRules[match][accountId].categoryId },
        filterBy: { description: { type: 'equals', value: match } }
      }
      existingRules[match][accountId].transactions.forEach((transaction) => {
        changes[transaction.id] = { ...transaction, ruleId }
      })
    })
  })

  return {
    ...state,
    transactions: {
      ...state.transactions,
      list: state.transactions.list.map((transaction) => {
        if (transaction.id in changes) return changes[transaction.id]
        return transaction
      })
    },
    budget: {
      ...state.budget,
      rules: Object.values(state.budget.rules).reduce(
        (res, rule) => ('id' in rule ? { ...res, [rule.id]: rule } : res), newRules
      )
    }
  }
}
