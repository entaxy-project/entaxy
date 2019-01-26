/* eslint-disable no-console */
import { isEqual, isNil } from 'lodash'
import Papa from 'papaparse'
import parse from 'date-fns/parse'

const DONT_IMPORT = 'Don\'t import'

// The base class for all CSV parsers
export default class CsvParser {
  constructor(file) {
    this._file = file
    this._columnsCount = 0
    this._headerRowIndex = 0
    // this._errors = { base: [], transactions: {} }
    // this._currentRow = 0
    // this._headerIsValid = false
    // this._header = [] // This should be overriten in a deriver class
    // this._config = { header: true } // Specific parser configuration - override in derived class
  }

  // Look through the first few rows and return the most common number of columns
  countColumns(rows) {
    // crete a hash with {numColums: numRows}
    const columnCount = rows.reduce((count, row) => {
      return {
        ...count,
        [row.length]: (count[row.length] || 0) + 1
      }
    }, {})

    // Select the most common column length
    const mostCommonLength = Object.keys(columnCount)
      .reduce((mostCommon, length) => (
        columnCount[length] > columnCount[mostCommon] ? length : mostCommon
      ))
    return parseInt(mostCommonLength, 10)
  }

  // Return the first row that has the same number of columns as most of the other rows
  findHeaderRow(rows) {
    return rows.findIndex(row => row.length === this._columnsCount)
  }

  mapHeaderRow() {
    const transactionFields = {
      description: /Description|Memo/gi,
      amount: /Amount/gi,
      createdAt: /Date/gi
    }
    return this._csvData[this._headerRowIndex].reduce((res, columnHeader) => {
      const transactionField = Object.keys(transactionFields).find(field => (
        transactionFields[field].test(columnHeader)
      ))
      console.log('transactionField', columnHeader, transactionField)
      return ({ ...res, [columnHeader]: transactionField || DONT_IMPORT })
    }, {})
  }

  getHeaders() {
    return new Promise((resolve) => {
      Papa.parse(this._file, {
        preview: 10,
        trimHeaders: true,
        dynamicTyping: true,
        skipEmptyLines: 'greedy',
        complete: (results) => {
          this._csvData = results.data
          this._columnsCount = this.countColumns(this._csvData)
          this._headerRowIndex = this.findHeaderRow(this._csvData)
          return resolve(this.mapHeaderRow())
        }
      })
    })
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

  parse() {
    return new Promise((resolve) => {
      Papa.parse(this._file, {
        trimHeaders: true,
        dynamicTyping: true,
        skipEmptyLines: 'greedy',
        complete: results => resolve(results)
      })
    })
  }
  // parse(file, account) {
  //   const transactions = []
  //   return new Promise((resolve) => {
  //     Papa.parse(file, {
  //       trimHeaders: true,
  //       dynamicTyping: true,
  //       skipEmptyLines: 'greedy',
  //       complete: (results) => {
  //         this._currentRow = 0
  //         this.validateHeader(results.meta.fields) // The first row is the header
  //         // Record any errors from the parsing library
  //         results.errors.forEach((error) => {
  //           this.addError(`${error.type}: (row ${error.row}) ${error.message}`, 'base')
  //         })
  //         if (!this.hasErrors()) {
  //           // Generate the transactions
  //           results.data.forEach((row) => {
  //             transactions.push(this.map(row, { id: uuid(), accountId: account.id }))
  //             this._currentRow += 1
  //           })
  //         }
  //         // Return the transactions and any errors found
  //         resolve({ transactions, errors: this._errors })
  //       },
  //       ...this._config
  //     })
  //   })
  // }

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
    const parsedDate = parse(`${year}-${month}-${day}`)
    // // Record any errors
    if (Number.isNaN(parsedDate.getTime())) {
      this.addError(`Invalid date. Expecting format '${format}'`)
      return null
    }

    return parsedDate.getTime()
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
