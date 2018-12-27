import CsvParser from './CsvParser'

export default class RbcCsvParser extends CsvParser {
  constructor() {
    super()
    this._header = [
      'Account Type',
      'Account Number',
      'Transaction Date',
      'Cheque Number',
      'Description 1',
      'Description 2',
      'CAD$',
      'USD$'
    ]
  }

  map(row, accountData) {
    const amount = (row.CAD$ === null ? parseFloat(row.USD$) : parseFloat(row.CAD$))
    return {
      ...accountData,
      type: (amount >= 0 ? 'buy' : 'sell'),
      // ticker: (row.CAD$ === null ? 'USD' : 'CAD'),
      shares: amount,
      bookValue: 1,
      description: this.parseString(`${row['Description 1']} - ${row['Description 1']}`),
      createdAt: this.parseDate(row['Transaction Date'], 'mm/dd/yyyy')
    }
  }
}
