import React from 'react'
import renderer from 'react-test-renderer'
import ImportResults from '../ImportResults'

describe('ImportResults', () => {
  const mockOnSave = jest.fn()
  const mockOnCancel = jest.fn()
  jest.mock('../ImportResults', () => 'ImportResults')
  jest.mock('../CsvImportFields', () => 'CsvImportFields')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot for BMO without errors', () => {
    const component = renderer.create((
      <ImportResults
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        errors={{ base: [], transactions: [] }}
        transactions={[{ 0: {} }]}
        classes={{ }}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot for BMO with errors on the header', () => {
    const component = renderer.create((
      <ImportResults
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        errors={{ base: ['some error'], transactions: [] }}
        transactions={[{ 0: {} }]}
        classes={{ }}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot for BMO with 1 error on a transaction', () => {
    const component = renderer.create((
      <ImportResults
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        errors={{ base: [], transactions: [{ 0: ['some error'] }] }}
        transactions={[{ 0: {} }]}
        classes={{ }}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
