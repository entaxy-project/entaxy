import uuid from 'uuid/v4'
import CsvParser from './CsvParser'

export default class TangerineCsvParser extends CsvParser {
  constructor(file) {
    super(file)
    this._header = [
      'Date',
      'Transaction',
      'Name',
      'Memo',
      'Amount'
    ]
  }

  map(row) {
    const [month, day, year] = row.Date.split('/')
    return {
      id: uuid(),
      institution: 'Tangerine',
      account: 'Checking', // This needs to be an option passed in
      type: (row.Amount >= 0 ? 'buy' : 'sell'),
      ticker: 'CAD', // This needs to be an option passed in
      shares: row.Amount,
      bookValue: 1,
      description: (row.Memo === null ? '' : row.Memo.trim()),
      createdAt: Date.parse(`${year}/${month}/${day}`)
    }
  }
}
