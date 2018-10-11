import uuid from 'uuid/v4'
import CsvParser from './CsvParser'

export default class TangerineCsvParser extends CsvParser {
  constructor(file, values) {
    super(file)
    this._header = [
      'Date',
      'Transaction',
      'Name',
      'Memo',
      'Amount'
    ]
    this._values = values
  }

  map(row) {
    const [month, day, year] = row.Date.split('/')
    return {
      id: uuid(),
      institution: 'Tangerine',
      account: this._values.account,
      type: (row.Amount >= 0 ? 'buy' : 'sell'),
      ticker: this._values.ticker,
      shares: row.Amount,
      bookValue: 1,
      description: (row.Memo === null ? '' : row.Memo.trim()),
      createdAt: Date.parse(`${year}/${month}/${day}`)
    }
  }
}
