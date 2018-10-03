import uuid from 'uuid/v4'
import CsvParser from './CsvParser'

export default class BmoCsvParser extends CsvParser {
  constructor(file) {
    super(file)
    this._config = {
      // beforeFirstChunk: (chunk) => {
      //   console.log('chunk', chunk)
      //   const rows = chunk.split(/\r\n|\r|\n/)
      //   return rows.slice(3)
      // }
      comments: 'Following data is valid as of'
    }
    this._header = [
      'First Bank Card',
      'Transaction Type',
      'Date Posted',
      'Transaction Amount',
      'Description'
    ]
  }

  map(row) {
    return {
      id: uuid(),
      institution: 'BMO',
      account: row['First Bank Card'],
      type: (row['Transaction Amount'] >= 0 ? 'buy' : 'sell'),
      ticker: 'CAD',
      shares: row['Transaction Amount'],
      bookValue: 1,
      description: row.Description,
      createdAt: Date.parse(row['Date Posted'])
    }
  }
}
