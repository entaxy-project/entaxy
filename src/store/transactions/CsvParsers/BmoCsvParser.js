import uuid from 'uuid/v4'
import CsvParser from './CsvParser'

export default class BmoCsvParser extends CsvParser {
  constructor(file) {
    super(file)
    this._config = {
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

  map(row) {
    const date = {
      year: row['Date Posted'].toString().slice(0, 4),
      month: row['Date Posted'].toString().slice(4, 6),
      day: row['Date Posted'].toString().slice(6)
    }
    return {
      id: uuid(),
      institution: 'BMO',
      account: row['First Bank Card'],
      type: (row['Transaction Amount'] >= 0 ? 'buy' : 'sell'),
      ticker: 'CAD',
      shares: row['Transaction Amount'],
      bookValue: 1,
      description: row.Description.trim(),
      createdAt: Date.parse(`${date.year}/${date.month}/${date.day}`)
    }
  }
}
