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
    return {
      id: uuid(),
      institution: 'Tangerine',
      account: this._values.account,
      type: (row.Amount >= 0 ? 'buy' : 'sell'),
      ticker: this._values.ticker,
      shares: row.Amount,
      bookValue: 1,
      description: this.parseString(row.Memo),
      createdAt: this.parseDate(row.Date, 'mm/dd/yyyy')
    }
  }
}
