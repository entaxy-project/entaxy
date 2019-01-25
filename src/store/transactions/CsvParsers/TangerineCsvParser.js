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

  map(row, accountData) {
    return {
      ...accountData,
      amount: row.Amount,
      category: '',
      description: this.parseString(row.Memo),
      createdAt: this.parseDate(row.Date, 'mm/dd/yyyy')
    }
  }
}
