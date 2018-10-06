import uuid from 'uuid/v4'
import CsvParser from './CsvParser'

export default class RbcCsvParser extends CsvParser {
  constructor(file) {
    super(file)
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

  map(row) {
    const [month, day, year] = row['Transaction Date'].split('/')
    const amount = (row.CAD$ === null ? parseFloat(row.USD$) : parseFloat(row.CAD$))
    return {
      id: uuid(),
      institution: 'RBC',
      account: row['Account Type'],
      type: (amount >= 0 ? 'buy' : 'sell'),
      ticker: (row.CAD$ === null ? 'USD' : 'CAD'),
      shares: amount,
      bookValue: 1,
      description: `${row['Description 1']} - ${row['Description 1']}`.trim(),
      createdAt: Date.parse(`${year}/${month}/${day}`)
    }
  }
}
