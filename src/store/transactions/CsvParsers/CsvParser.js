/* eslint-disable prefer-destructuring */
import { isNil } from 'lodash'
import Papa from 'papaparse'
import parse from 'date-fns/parse'

const DONT_IMPORT = 'Don\'t import'
export const DATE_FORMATS = {
  'mm/dd/yyyy': (string) => {
    const [, month, day, year] = (/(\d{1,2})\/(\d{1,2})\/(\d{4})/gi).exec(string)
    return [year, month, day]
  },
  yyyyymmdd: (string) => {
    const [, year, month, day] = (/(\d{4})(\d{2})(\d{2})/gi).exec(string)
    return [year, month, day]
  }
}
const TRANSACTION_FIELDS = {
  description1: {
    label: 'Description 1',
    regex: /Description|Name|Memo/gi
  },
  description2: {
    label: 'Description 2',
    regex: /Description|Name|Memo/gi
  },
  amount: {
    label: 'Amount',
    regex: /Amount/gi
  },
  income: {
    label: 'Income',
    regex: /Credit/gi
  },
  expense: {
    label: 'Expense',
    regex: /Debit/gi
  },
  createdAt: {
    label: 'Date',
    regex: /Date/gi
  }
}

// The base class for all CSV parsers
export default class CsvParser {
  constructor() {
    this._csvData = []
    this._csvHeader = []
    this._columnsCount = 0
    this._firstRowIndex = 0
    this._noHeaderRow = false
    this._dateFormat = Object.keys(DATE_FORMATS)[0]
    this._errors = { base: [], transactions: {} }
    this._currentRow = 0
  }

  get csvData() {
    return this._csvData
  }

  get csvHeader() {
    return this._csvHeader
  }

  get firstRowIndex() {
    return this._firstRowIndex
  }

  get transactionFields() {
    return TRANSACTION_FIELDS
  }

  isFieldSelected(transactionField) {
    return this._csvHeader.findIndex(column => column.transactionField === transactionField) !== -1
  }

  mapColumnToTransactionField({ columnIndex, transactionField }) {
    this._csvHeader[columnIndex].transactionField = transactionField
  }

  get dateFormats() {
    return Object.keys(DATE_FORMATS)
  }

  get dateFormat() {
    return this._dateFormat
  }

  set dateFormat(newDateFormat) {
    this._dateFormat = newDateFormat
  }

  get noHeaderRow() {
    return this._noHeaderRow
  }

  set noHeaderRow(value) {
    this._noHeaderRow = value
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
  findFirstRow() {
    this._firstRowIndex = this._csvData.findIndex(row => row.length === this._columnsCount)
  }

  mapHeaderToTransactionFields() {
    let rowCount = -1
    this._csvHeader = this._csvData[this._firstRowIndex].reduce((res, columnHeader) => {
      rowCount += 1
      const transactionField = Object.keys(TRANSACTION_FIELDS).find(field => (
        TRANSACTION_FIELDS[field].regex.test(columnHeader)
      ))
      return [
        ...res,
        {
          label: columnHeader,
          transactionField: transactionField || DONT_IMPORT,
          sample: this._csvData[this._firstRowIndex + 1][rowCount]
        }
      ]
    }, [])
  }


  parse(file) {
    this._file = file
    return new Promise((resolve) => {
      Papa.parse(this._file, {
        trimHeaders: true,
        dynamicTyping: true,
        skipEmptyLines: 'greedy',
        complete: (results) => {
          this._csvData = results.data
          this.countColumns()
          this.findFirstRow()

          // Record any errors from the parsing library
          results.errors.forEach((error) => {
            this.addError(`${error.type}: (row ${error.row}) ${error.message}`, 'base')
          })

          this.mapHeaderToTransactionFields()
          this.detectDateFormat()
          return resolve()
        }
      })
    })
  }

  hasErrors() {
    return this._errors.base.length > 0 || Object.keys(this._errors.transactions).length > 0
  }

  mapToTransactions() {
    const transactions = []
    const columns = this._csvHeader.reduce((res, column, index) => {
      if (column.transactionField === DONT_IMPORT) return res
      return { ...res, [column.transactionField]: index }
    }, {})

    this._csvData.forEach((row, index) => {
      if (this._noHeaderRow || index > this._firstRowIndex) {
        const amount = this.readAmount(row, columns)
        const description = this.readDescription(row, columns)
        const createdAt = this.dateFromString(row[columns.createdAt])
        const errors = []
        if (typeof amount !== 'number') {
          errors.push('Could not read the amount')
        } else if (createdAt === null) {
          errors.push(`Invalid date. Expecting format '${this._dateFormat}'`)
        }
        transactions.push({
          amount,
          description,
          createdAt,
          errors
        })
      }
    })
    return { transactions, errors: this._errors }
  }

  readAmount(row, columns) {
    let amount
    if (Object.keys(columns).includes('amount')) {
      amount = row[columns.amount]
    } else if (Object.keys(columns).includes('income') && row[columns.income] !== null) {
      amount = row[columns.income]
    } else if (Object.keys(columns).includes('expense') && row[columns.expense] !== null) {
      amount = -row[columns.expense]
    }
    return amount
  }

  readDescription(row, columns) {
    const description = ['description1', 'description2'].reduce((acc, column) => {
      if (Object.keys(columns).includes(column)) {
        return [
          ...acc,
          (isNil(row[columns[column]]) ? '' : row[columns[column]].trim())
        ]
      }
      return acc
    }, [])
    return description.join(' - ')
  }

  dateFromString(dateString) {
    let string
    try {
      string = dateString.toString()
    } catch (error) {
      return null
    }
    try {
      const [year, month, day] = DATE_FORMATS[this._dateFormat](string)
      return parse(`${year}-${month}-${day}`).getTime()
    } catch (error) {
      return null
    }
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

  // Run all the date formats by the column data and pick the one that doesn't fail
  findDateFormatFor(string) {
    return Object.keys(DATE_FORMATS).find((dateFormat) => {
      try {
        const [year, month, day] = DATE_FORMATS[dateFormat](string)
        parse(`${year}-${month}-${day}`)
      } catch (error) {
        return false
      }
      return true
    })
  }

  detectDateFormat() {
    // Do we have a date column yet?
    const createdAtIndex = this._csvHeader.findIndex(column => column.transactionField === 'createdAt')

    // We don't have a date column yet so test all the columns of each row
    if (createdAtIndex === -1) {
      const formatMap = {} // { yyyyymmdd: {columnIndex: totalMatches, ...} }}
      let dateColumnIndex = -1
      let bestDateFormat = Object.keys(DATE_FORMATS)[0]
      let totalMatches = 0
      this._csvData.some((row) => {
        row.forEach((cell, index) => {
          const dateFormat = this.findDateFormatFor(cell)
          if (dateFormat !== undefined) {
            if (!Object.keys(formatMap).includes(dateFormat)) {
              formatMap[dateFormat] = { [index]: 0 }
            }
            if (!Object.keys(formatMap[dateFormat]).includes(`${index}`)) {
              formatMap[dateFormat][index] = 0
            }
            formatMap[dateFormat][index] += 1
            // Record the best match
            if (formatMap[dateFormat][index] > totalMatches) {
              totalMatches = formatMap[dateFormat][index]
              bestDateFormat = dateFormat
              dateColumnIndex = index
            }
          }
        })
        // Leave the loop as soon as we have enought confirmed matches
        if (totalMatches >= 10) return true
        // Otherwise keep going
        return false
      })
      // Select the best match
      this._dateFormat = bestDateFormat
      // Set the Date column
      if (dateColumnIndex > -1) {
        this._csvHeader[dateColumnIndex].transactionField = 'createdAt'
      }
    } else {
      this._dateFormat = this.findDateFormatFor(this._csvHeader[createdAtIndex].sample)
    }


    // We didn't find any good format so just pick the first one
    if (this._dateFormat === null) {
      this._dateFormat = Object.keys(DATE_FORMATS)[0]
    }
  }
}
