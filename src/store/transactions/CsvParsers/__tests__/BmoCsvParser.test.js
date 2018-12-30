import BmoCsvParser from '../BmoCsvParser'

const csvData = [
  'Following data is valid as of 20180927111542 (Year/Month/Day/Hour/Minute/Second)',
  '',
  '',
  'First Bank Card,Transaction Type,Date Posted, Transaction Amount,Description',
  '',
  '',
  '\'500766**********\',DEBIT,20180628,-650.0,[SO]2211#8503-567 ',
  '\'500766**********\',CREDIT,20180629,2595.11,[DN]THE WORKING GRO PAY/PAY  ',
  '\'500766**********\',CREDIT,20180629,0.01,[IN]  ',
  '\'500766**********\',CREDIT,20180629,325.0,[CW]INTERAC E-TRANSFER       RECEIVED 20181801732942BE7   '
]

const expectedTransactions = [
  {
    accountId: 1,
    amount: -650,
    description: '[SO]2211#8503-567',
    createdAt: Date.parse('2018/06/28')
  },
  {
    accountId: 1,
    amount: 2595.11,
    description: '[DN]THE WORKING GRO PAY/PAY',
    createdAt: Date.parse('2018/06/29')
  },
  {
    accountId: 1,
    amount: 0.01,
    description: '[IN]',
    createdAt: Date.parse('2018/06/29')
  },
  {
    accountId: 1,
    amount: 325,
    description: '[CW]INTERAC E-TRANSFER       RECEIVED 20181801732942BE7',
    createdAt: Date.parse('2018/06/29')
  }
]

describe('BMO CSV parser', () => {
  const account = {
    id: 1,
    currency: 'CAD'
  }
  describe('parse', () => {
    it('returns transactions', async () => {
      const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
      const { transactions, errors } = await new BmoCsvParser().parse(file, account)

      expect(errors.base.length).toBe(0)
      expect(Object.keys(errors.transactions).length).toBe(0)
      expect(transactions).toMatchObject(expectedTransactions)
      expect(transactions[0].id).not.toBeNull()
    })

    it('fails if the header doesn\'t match', async () => {
      // Remove spaces from header
      const oldHeader = csvData[3].split(',').map(string => string.trim()).join(',')
      csvData[3] = 'something else'
      const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
      const { transactions, errors } = await new BmoCsvParser().parse(file, account)

      expect(transactions.length).toBe(0)
      expect(errors.base.length).toBe(5)
      expect(errors.base[0]).toBe(`Invalid header. Expected [${oldHeader}] but found [${csvData[3]}]`)
      expect(Object.keys(errors.transactions).length).toBe(0)
    })
  })
})
