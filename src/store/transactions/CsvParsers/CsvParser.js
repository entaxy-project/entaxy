import uuid from 'uuid/v4'
import { isEqual, isNil } from 'lodash'
import Papa from 'papaparse'

// The base class for all CSV parsers
export default class CsvParser {
  constructor() {
    this._errors = { base: [], transactions: {} }
    this._currentRow = 0
    this._headerIsValid = false
    this._header = [] // This should be overriten in a deriver class
    this._config = { header: true } // Specific parser configuration - override in derived class
  }

  hasErrors() {
    return this._errors.base.length > 0 || Object.keys(this._errors.transactions).length > 0
  }

  validateHeader(row) {
    if (!this._config.header) {
      // Skip if the file has no headers
      this._headerIsValid = true
    } else {
      // Otherwise compare the header in the parser with the one from the file
      this._headerIsValid = isEqual(row, this._header)
      if (!this._headerIsValid) {
        this.addError(`Invalid header. Expected [${this._header}] but found [${row}]`, 'base')
      }
    }
  }

  // This should be overriten in a derived class
  map(row) {
    throw (new Error(`map() method not defined ${row}`))
  }

  parse(file, account) {
    const transactions = []
    return new Promise((resolve) => {
      Papa.parse(file, {
        trimHeaders: true,
        dynamicTyping: true,
        skipEmptyLines: 'greedy',
        complete: (results) => {
          this._currentRow = 0
          this.validateHeader(results.meta.fields) // The first row is the header
          // Record any errors from the parsing library
          results.errors.forEach((error) => {
            this.addError(`${error.type}: (row ${error.row}) ${error.message}`, 'base')
          })
          if (!this.hasErrors()) {
            // Generate the transactions
            results.data.forEach((row) => {
              transactions.push(this.map(row, {
                id: uuid(),
                accountId: account.id,
                ticker: account.currency
              }))
              this._currentRow += 1
            })
          }
          // Return the transactions and any errors found
          resolve({ transactions, errors: this._errors })
        },
        ...this._config
      })
    })
  }

  parseString(string) {
    return (isNil(string) ? '' : string.trim())
  }

  // Returns a timestamp in milliseconds from a date string
  // Possible formats
  //    mm/dd/yyyy
  //    yyyymmdd
  parseDate(dateString, format) {
    let string = null
    // Make sure we have a string we can parse
    try {
      string = dateString.toString()
    } catch (error) {
      this.addError(`Invalid date. Expecting format '${format}'`)
      return null
    }

    // Split the string acording to format
    const [month, day, year] = {
      'mm/dd/yyyy': value => (value.split('/')),
      yyyymmdd: (value) => {
        const date = {
          year: value.slice(0, 4),
          month: value.slice(4, 6),
          day: value.slice(6)
        }
        return [date.month, date.day, date.year]
      }
    }[format](string)

    // Try to generate a Date object
    const parsedDate = Date.parse(`${year}/${month}/${day}`)

    // Record any errors
    if (Number.isNaN(parsedDate)) {
      this.addError(`Invalid date. Expecting format '${format}'`)
      return null
    }
    return parsedDate
  }

  // Adds an error either to the base which  relative to the file in general
  // or to a specific transaction
  addError(error, type) {
    if (type === 'base') {
      this._errors.base.push(error)
    } else {
      if (!(this._currentRow in this._errors.transactions)) {
        this._errors.transactions[this._currentRow] = []
      }
      this._errors.transactions[this._currentRow].push(error)
    }
  }
}
