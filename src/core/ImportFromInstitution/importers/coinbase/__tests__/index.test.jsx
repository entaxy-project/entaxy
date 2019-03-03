import parse from 'date-fns/parse'
import Big from 'big.js'
import {
  normalizeAccounts,
  normalizeTransactions
} from '..'

const accounts = [{
  id: 'd4f06af7-b529-5ffc-a187-5ae79f2a5522',
  name: 'BTC wallet',
  native_balance: { amount: '0.00000000', currency: 'CAD' },
  currency: 'BTC',
  created_at: '2018-09-20T00:15:54Z'
}]

const transactions = [{
  id: 'd4f06af7-b529-5ffc-a187-5ae79f2a5522',
  details: { title: 'Sent Bitcoin', subtitle: 'To Bitcoin address' },
  amount: { amount: '-0.00347058', currency: 'BTC' },
  native_amount: { amount: '-28.66', currency: 'CAD' },
  created_at: '2018-09-20T00:15:54Z'
}]

describe('Coinbase API importer', () => {
  it('should normalizeAccounts', () => {
    expect(normalizeAccounts([])).toEqual([])
    expect(normalizeAccounts(accounts)).toEqual([{
      type: 'wallet',
      sourceId: accounts[0].id,
      name: accounts[0].name,
      currency: accounts[0].native_balance.currency,
      symbol: accounts[0].currency,
      openingBalance: 0,
      openingBalanceDate: parse(accounts[0].created_at).getTime()
    }])
  })

  it('should normalizeTransactions', () => {
    expect(normalizeTransactions([])).toEqual([])

    const nativeAmount = Big(transactions[0].native_amount.amount)
    const amount = Big(transactions[0].amount.amount)

    expect(normalizeTransactions(transactions)).toEqual([{
      amount: parseFloat(amount),
      sourceId: transactions[0].id,
      description: [transactions[0].details.title, transactions[0].details.subtitle].join(' - '),
      nativeAmount: parseFloat(nativeAmount),
      pricePerUnit: parseFloat(nativeAmount.div(amount).abs()),
      createdAt: parse(transactions[0].created_at).getTime()
    }])
  })
})
