import RbcCsvParser from '../RbcCsvParser'

const csvData = [
  "Account Type,Account Number,Transaction Date,Cheque Number,Description 1,Description 2,CAD$,USD$",
  "Chequing,nnnnn-nnnnnnn,6/25/2018,,Email Trfs,INTERAC E-TRF- 6319 ,20,",
  "Chequing,nnnnn-nnnnnnn,6/29/2018,,PAYROLL DEPOSIT,THE WORKING GRO ,2742.03,",
  "Savings,nnnnn-nnnnnnn,8/22/2018,,DEPOSIT,,,5300",
  "Visa,4514xxxxxxxxxxxx,8/13/2018,,LYFT *RIDE MON 11AM VANCOUVER BC,,-16.61,"
]

const expectedTransactions = [
  {
    "account": "Chequing",
    "bookValue": 1,
    "createdAt": 1529899200000,
    "description": "Email Trfs - Email Trfs",
    "institution": "RBC",
    "shares": 20,
    "ticker": "CAD",
    "type": "buy"
  },
  {"account": "Chequing",
    "bookValue": 1,
    "createdAt": 1530244800000,
    "description": "PAYROLL DEPOSIT - PAYROLL DEPOSIT",
    "institution": "RBC",
    "shares": 2742.03,
    "ticker": "CAD",
    "type": "buy"
  },
  {"account": "Savings",
    "bookValue": 1,
    "createdAt": 1534910400000,
    "description": "DEPOSIT - DEPOSIT",
    "institution": "RBC",
    "shares": 5300,
    "ticker": "USD",
    "type": "buy"
  },
  {"account": "Visa",
    "bookValue": 1,
    "createdAt": 1534132800000,
    "description": "LYFT *RIDE MON 11AM VANCOUVER BC - LYFT *RIDE MON 11AM VANCOUVER BC",
    "institution": "RBC",
    "shares": -16.61,
    "ticker": "CAD",
    "type": "sell"
  }
]

describe('BMO CSV parser', () => {
  describe('parse', () => {
    it('returns transactions', async () => {
      const file = new File([csvData.join("\n")], 'test.csv', { type: 'text/csv' });
      const { transactions, errors } = await new RbcCsvParser().parse(file)

      expect(transactions.length).toBe(csvData.length - 1)
      expect(errors.base.length).toBe(0)
      expect(Object.keys(errors.transactions).length).toBe(0)
      expect(transactions).toMatchObject(expectedTransactions)
      expect(transactions[0].id).not.toBeNull()
    })

    it("fails if the header doesn't match", async () => {
      const oldHeader = csvData[0]
      csvData[0] = 'something else'
      const file = new File([csvData.join("\n")], 'test.csv', { type: 'text/csv' });
      const { transactions, errors } = await new RbcCsvParser().parse(file)

      expect(transactions.length).toBe(0)
      expect(errors.base.length).toBe(csvData.length)
      expect(errors.base[0]).toBe(`Invalid header. Expected [${oldHeader}] but found [${csvData[0]}]`)
      expect(Object.keys(errors.transactions).length).toBe(0)
    })
  })
})
