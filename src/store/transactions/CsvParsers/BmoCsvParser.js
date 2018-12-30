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
      amount: row['Transaction Amount'],
      description: this.parseString(row.Description),
      createdAt: this.parseDate(row['Date Posted'], 'yyyymmdd')
    }
  }
}
