/* eslint no-console: 0 */
import uuid from 'uuid/v4'
import CsvParser from './CsvParser'

export default class BmoCsvParser extends CsvParser {
  constructor(file, values) {
    super(file)
    this._config = {
      ...this._config,
      comments: 'Following data is valid as of' // Skipp these lines
    }
    this._header = [
      'First Bank Card',
      'Transaction Type',
      'Date Posted',
      'Transaction Amount',
      'Description'
    ]
    this._values = values
  }

  map(row) {
    return {
      id: uuid(),
      institution: 'BMO',
      account: row['First Bank Card'],
      type: (row['Transaction Amount'] >= 0 ? 'buy' : 'sell'),
      ticker: this._values.ticker,
      shares: row['Transaction Amount'],
      bookValue: 1,
      description: this.parseString(row.Description),
      createdAt: this.parseDate(row['Date Posted'], 'yyyymmdd')
    }
  }
}
