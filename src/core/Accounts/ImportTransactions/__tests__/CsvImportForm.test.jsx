import React from 'react'
import renderer from 'react-test-renderer'
import CsvImportForm from '../CsvImportForm'

describe('CsvImportForm', () => {
  const mockhandleParsedData = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot for BMO', () => {
    const component = renderer.create((
      <CsvImportForm
        handleParsedData={mockhandleParsedData}
        onCancel={mockOnCancel}
        account={{ id: 1, institution: 'BMO' }}
        classes={{ }}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
