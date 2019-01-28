/* eslint-disable no-console */
/* eslint-disable prefer-destructuring */
import { isNil } from 'lodash'
import Papa from 'papaparse'
import parse from 'date-fns/parse'

const DONT_IMPORT = 'Don\'t import'
const DATE_FORMATS = [
  'mm/dd/yyyy',
  'yyyymmdd'
]

// The base class for all CSV parsers
export default class CsvParser {
  constructor() {
    this._columnsCount = 0
    this._headerRowIndex = 0
    this._dateFormat = DATE_FORMATS[0]
    this._errors = { base: [], transactions: {} }
    // this._currentRow = 0
    // this._headerIsValid = false
    // this._header = [] // This should be overriten in a deriver class
    // this._config = { header: true } // Specific parser configuration - override in derived class
  }

  get headerRowIndex() {
    return this._headerRowIndex
  }

  get dateFormats() {
    return DATE_FORMATS
  }

  get dateFormat() {
    return this._dateFormat
  }

  set dateFormat(newDateFormat) {
    this._dateFormat = newDateFormat
  }

  // Look through the first few rows and find the most common number of columns
  countColumns() {
    // crete a hash with {numColums: numRows}
    const columnCount = this._csvData.reduce((count, row) => {
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

    this._columnsCount = parseInt(mostCommonLength, 10)
  }

  // Find the first row that has the same number of columns as most of the other rows
  findHeaderRow() {
    this._headerRowIndex = this._csvData.findIndex(row => row.length === this._columnsCount)
  }

  mapHeaderToTransactionFields() {
    const transactionFields = {
      description: /Description|Memo/gi,
      amount: /Amount/gi,
      createdAt: /Date/gi
    }
    return this._csvData[this._headerRowIndex].reduce((res, columnHeader) => {
      const transactionField = Object.keys(transactionFields).find(field => (
        transactionFields[field].test(columnHeader)
      ))
      return ({
        ...res,
        [columnHeader]: transactionField || DONT_IMPORT
      })
    }, {})
  }

  getHeaders(file) {
    this._file = file
    return new Promise((resolve) => {
      Papa.parse(this._file, {
        trimHeaders: true,
        dynamicTyping: true,
        skipEmptyLines: 'greedy',
        complete: (results) => {
          this._csvData = results.data
          this.countColumns()
          this.findHeaderRow()

          // Record any errors from the parsing library
          results.errors.forEach((error) => {
            this.addError(`${error.type}: (row ${error.row}) ${error.message}`, 'base')
          })

          return resolve(this.mapHeaderToTransactionFields())
        }
      })
    })
  }

  hasErrors() {
    return this._errors.base.length > 0 || Object.keys(this._errors.transactions).length > 0
  }

  // This should be overriten in a derived class
  map(row) {
    throw (new Error(`map() method not defined ${row}`))
  }

  mapToTransactions({ transactionFieldsMap }) {
    const transactions = []
    this._csvData.forEach((row, index) => {
      if (index > this._headerRowIndex) {
        transactions.push({
          amount: row[transactionFieldsMap.amount.column.index],
          description: this.parseString(`${row[transactionFieldsMap.description.column.index]}`),
          createdAt: this.parseDate(row[transactionFieldsMap.createdAt.column.index], 'mm/dd/yyyy')
        })
      }
    })
    return transactions
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

  detectDateFormat() {

  }
}
