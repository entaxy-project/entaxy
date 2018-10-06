import uuid from 'uuid/v4'
import CsvParser from './CsvParser'

export default class BmoCsvParser extends CsvParser {
  constructor(file) {
    super(file)
    this._config = {
      header: false // This CSV file has no header
    }
  }

  // [0] Date
  // [1] Description
  // [2] Withdrawals
  // [3] Deposits
  // [4] Balance
  map(row) {
    const [month, day, year] = row[0].split('/') // Date
    return {
      id: uuid(),
      institution: 'TD',
      account: 'Cheching', // This needs to be an option passed in
      type: (row[2] === null ? 'buy' : 'sell'),
      ticker: 'CAD', // This needs to be an option passed in
      shares: (row[2] === null ? row[3] : row[2]),
      bookValue: 1,
      description: row[1].trim(), // Description
      createdAt: Date.parse(`${year}/${month}/${day}`)
    }
  }
}
