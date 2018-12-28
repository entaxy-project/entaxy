import CsvParser from './CsvParser'

export default class BmoCsvParser extends CsvParser {
  constructor() {
    super()
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
  }

  map(row, accountData) {
    return {
      ...accountData,
      type: (row['Transaction Amount'] >= 0 ? 'buy' : 'sell'),
      shares: row['Transaction Amount'],
      bookValue: 1,
      description: this.parseString(row.Description),
      createdAt: this.parseDate(row['Date Posted'], 'yyyymmdd')
    }
  }
}
