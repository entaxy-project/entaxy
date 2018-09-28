import _ from 'lodash'
import types from '../types'

describe('default exported types', () => {
  it('should have the default exported types', () => {
    const expectedTypes = [
      'LOAD_TRANSACTIONS',
      'CREATE_TRANSACTION',
      'UPDATE_TRANSACTION',
      'DELETE_TRANSACTION'
    ]

    expect(_.difference(_.keys(types), expectedTypes)).toEqual([])
  })

  it('should have the same key and value for the exported types', () => {
    _.map(types, (key, value) => {
      expect(value).toEqual(key)
    })
  })
})
