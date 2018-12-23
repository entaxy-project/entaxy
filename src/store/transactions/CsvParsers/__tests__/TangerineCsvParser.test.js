import TangerineCsvParser from '../TangerineCsvParser'

const csvData = [
  'Date,Transaction,Name,Memo,Amount',
  '10/1/2014,OTHER,Tangerine Savings Interest Rate ,TANGERINE BONUS RATE SALE 0914,4.75',
  '10/3/2014,CREDIT,Cheque-In Deposit,Transferred,2010',
  '10/3/2014,DEBIT,Internet Withdrawal to TFSA Kick,Transferred,-5500'
]

const expectedTransactions = [
  {
    institution: 'Tangerine',
    account: 'Checking',
    type: 'buy',
    ticker: 'CAD',
    shares: 4.75,
    bookValue: 1,
    description: 'TANGERINE BONUS RATE SALE 0914',
    createdAt: Date.parse('10/1/2014')
  },
  {
    institution: 'Tangerine',
    account: 'Checking',
    type: 'buy',
    ticker: 'CAD',
    shares: 2010,
    bookValue: 1,
    description: 'Transferred',
    createdAt: Date.parse('10/3/2014')
  },
  {
    institution: 'Tangerine',
    account: 'Checking',
    type: 'sell',
    ticker: 'CAD',
    shares: -5500,
    bookValue: 1,
    description: 'Transferred',
    createdAt: Date.parse('10/3/2014')
  }
]

describe('Tangerine CSV parser', () => {
  describe('parse', () => {
    it('returns transactions', async () => {
      const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
      const {
        transactions,
        errors
      } = await new TangerineCsvParser().parse(file, { account: 'Checking', ticker: 'CAD' })

      expect(errors.base.length).toBe(0)
      expect(Object.keys(errors.transactions).length).toBe(0)
      expect(transactions).toMatchObject(expectedTransactions)
      expect(transactions[0].id).not.toBeNull()
    })

    it('fails if the header doesn\'t match', async () => {
      const oldHeader = csvData[0]
      csvData[0] = 'something else'
      const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
      const {
        transactions,
        errors
      } = await new TangerineCsvParser().parse(file, { account: 'Checking', ticker: 'CAD' })

      expect(transactions.length).toBe(0)
      expect(errors.base.length).toBe(csvData.length)
      expect(errors.base[0]).toBe(`Invalid header. Expected [${oldHeader}] but found [${csvData[0]}]`)
      expect(Object.keys(errors.transactions).length).toBe(0)
      csvData[0] = oldHeader
    })

    it('generates error for invalid date', async () => {
      const oldHeader = csvData[0]
      csvData[1] = 'blah,OTHER,Tangerine Savings Interest Rate ,TANGERINE BONUS RATE SALE 0914,4.75'
      const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
      const { errors } = await new TangerineCsvParser().parse(file, { account: 'Checking', ticker: 'CAD' })
      expect(errors.base.length).toBe(0)
      expect(errors.transactions[0]).toMatchObject(['Invalid date. Expecting format \'mm/dd/yyyy\''])
      csvData[0] = oldHeader
    })
  })
})
