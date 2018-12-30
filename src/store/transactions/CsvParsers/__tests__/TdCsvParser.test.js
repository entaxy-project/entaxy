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
    accountId: 1,
    amount: 100,
    description: 'GC 0575-CASH WITHDRA',
    createdAt: Date.parse('09/04/2018')
  },
  {
    accountId: 1,
    amount: 63.95,
    description: 'NON-TD ATM W/D',
    createdAt: Date.parse('09/04/2018')
  },
  {
    accountId: 1,
    amount: 195,
    description: 'SEND E-TFR CA***G4e',
    createdAt: Date.parse('09/04/2018')
  },
  {
    accountId: 1,
    amount: -250,
    description: '',
    createdAt: Date.parse('09/07/2018')
  }
]

describe('TD CSV parser', () => {
  const account = {
    id: 1,
    currency: 'CAD'
  }
  describe('parse', () => {
    it('returns transactions', async () => {
      await new CsvParser().parse

      const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
      const { transactions, errors } = await new TdCsvParser().parse(file, account)

      expect(errors.base.length).toBe(0)
      expect(Object.keys(errors.transactions).length).toBe(0)
      expect(transactions).toMatchObject(expectedTransactions)
      expect(transactions[0].id).not.toBeNull()
    })

    it('generates error for invalid date', async () => {
      // Remove spaces from header
      csvData[0] = ',GC 0575-CASH WITHDRA,100.00,,588.61'
      const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
      const { transactions, errors } = await new TdCsvParser().parse(file, account)
      expect(transactions.length).toBe(csvData.length)
      expect(errors.base.length).toBe(0)
      expect(errors.transactions[0]).toMatchObject(['Invalid date. Expecting format \'mm/dd/yyyy\''])
    })
  })
})
