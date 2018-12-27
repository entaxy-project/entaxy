import CsvParser from './CsvParser'

export default class BmoCsvParser extends CsvParser {
  constructor() {
    super()
    this._config = {
      ...this._config,
      header: false // This CSV file has no header
    }
  }

  // [0] Date
  // [1] Description
  // [2] Withdrawals
  // [3] Deposits
  // [4] Balance
  map(row, accountData) {
    return {
      ...accountData,
      type: (row[2] === null ? 'buy' : 'sell'),
      shares: (row[2] === null ? row[3] : row[2]),
      bookValue: 1,
      description: this.parseString(row[1]), // Description
      createdAt: this.parseDate(row[0], 'mm/dd/yyyy')
    }
  }
}
