/* eslint-disable  no-unused-vars */
import { isEqual } from 'lodash'
import Papa from 'papaparse'

export default class CsvParser {
  constructor(file) {
    this._file = file
    this._errors = []
    this._headerIsValid = false
    this._header = [] // This should be overriten in a deriver class
    this._config = {} // Specific parser configuration - override in derived class
  }

  get hasErrors() {
    return this._errors.length > 0
  }

  validateHeader(row) {
    this._headerIsValid = isEqual(row, this._header)
    if (!this._headerIsValid) {
      this._errors.push(`Invalid header. Expected [${this._header}] but found [${row}]`)
    }
  }

  // This should be overriten in a deriver class
  map(row) {
    throw (new Error('map() method not defined'))
  }

  parse() {
    const transactions = []
    return new Promise((resolve, reject) => {
      Papa.parse(this._file, {
        ...this._config,
        header: true,
        trimHeaders: true,
        dynamicTyping: true,
        skipEmptyLines: 'greedy',
        complete: (results) => {
          // The first row is the header
          this.validateHeader(results.meta.fields)
          if (this._headerIsValid) {
            results.data.forEach((row) => {
              transactions.push(this.map(row))
            })
            resolve(transactions)
          } else {
            reject(this._errors)
          }
        }
      })
    })
  }
}
