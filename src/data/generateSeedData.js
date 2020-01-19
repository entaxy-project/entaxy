import { createAccount } from '../store/accounts/actions'
import { addTransactions } from '../store/transactions/actions'

const generateSeedData = () => async (dispatch, getState) => {
  const accountId = await dispatch(createAccount({
    accountType: 'bank',
    name: 'Checking',
    openingBalance: 0,
    institution: 'TD EasyWeb',
    currency: getState().settings.currency,
    currentBalance: { accountCurrency: 0, localCurrency: 0 },
    openingBalanceDate: Date.now()
  }))

  const { accounts, budget } = getState()
  const account = accounts.byId[accountId]
  const categoryIds = Object.keys(budget.categoriesById)
  const transactions = [...Array(120).keys()].map((key) => {
    const categoryId = categoryIds[Math.floor(Math.random() * categoryIds.length)]
    return {
      accountId,
      description: `Transaction ${key}`,
      amount: { accountCurrency: -(Math.random() * 100).toFixed(2) },
      createdAt: new Date(`2019-${1 + (key % 12)}-${Math.floor(Math.random() * 29) + 1}`).getTime(),
      categoryId: 'parentId' in budget.categoriesById[categoryId] ? categoryId : undefined
    }
  })

  dispatch(addTransactions(account, transactions))
}

export default generateSeedData
