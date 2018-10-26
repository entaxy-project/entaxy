import CsvParser from '../CsvParser'
import TdCsvParser from '../TdCsvParser'

const csvData = [
  '09/04/2018,GC 0575-CASH WITHDRA,100.00,,588.61',
  '09/04/2018,NON-TD ATM W/D      ,63.95,,524.66',
  '09/04/2018,SEND E-TFR CA***G4e ,195.00,,329.66',
  '09/07/2018,,,250.00,425.03'
]

const expectedTransactions = [
  {
    institution: 'TD',
    account: 'Checking',
    type: 'sell',
    ticker: 'CAD',
    shares: 100,
    bookValue: 1,
    description: 'GC 0575-CASH WITHDRA',
    createdAt: 1536033600000
  },
  {
    institution: 'TD',
    account: 'Checking',
    type: 'sell',
    ticker: 'CAD',
    shares: 63.95,
    bookValue: 1,
    description: 'NON-TD ATM W/D',
    createdAt: 1536033600000
  },
  {
    institution: 'TD',
    account: 'Checking',
    type: 'sell',
    ticker: 'CAD',
    shares: 195,
    bookValue: 1,
    description: 'SEND E-TFR CA***G4e',
    createdAt: 1536033600000
  },
  {
    institution: 'TD',
    account: 'Checking',
    type: 'buy',
    ticker: 'CAD',
    shares: 250,
    bookValue: 1,
    description: '',
    createdAt: 1536292800000
  }
]

describe('TD CSV parser', () => {
  describe('parse', () => {
    it('returns transactions', async () => {
      await new CsvParser().parse

      const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
      const { transactions, errors } = await new TdCsvParser().parse(file, { account: 'Checking', ticker: 'CAD' })

      expect(errors.base.length).toBe(0)
      expect(Object.keys(errors.transactions).length).toBe(0)
      expect(transactions).toMatchObject(expectedTransactions)
      expect(transactions[0].id).not.toBeNull()
    })

    it('generates error for invalid date', async () => {
      // Remove spaces from header
      csvData[0] = ',GC 0575-CASH WITHDRA,100.00,,588.61'
      const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
      const { transactions, errors } = await new TdCsvParser().parse(file, { account: 'Checking', ticker: 'CAD' })
      expect(transactions.length).toBe(csvData.length)
      expect(errors.base.length).toBe(0)
      expect(errors.transactions[0]).toMatchObject(['Invalid date. Expecting format \'mm/dd/yyyy\''])
    })
  })
})
