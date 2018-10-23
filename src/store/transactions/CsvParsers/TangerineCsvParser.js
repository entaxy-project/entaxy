import uuid from 'uuid/v4'
import CsvParser from './CsvParser'

export default class TangerineCsvParser extends CsvParser {
  constructor() {
    super()
    this._header = [
      'Date',
      'Transaction',
      'Name',
      'Memo',
      'Amount'
    ]
  }

  map(row, values) {
    return {
      id: uuid(),
      institution: 'Tangerine',
      account: values.account,
      type: (row.Amount >= 0 ? 'buy' : 'sell'),
      ticker: values.ticker,
      shares: row.Amount,
      bookValue: 1,
      description: this.parseString(row.Memo),
      createdAt: this.parseDate(row.Date, 'mm/dd/yyyy')
    }
  }
}
