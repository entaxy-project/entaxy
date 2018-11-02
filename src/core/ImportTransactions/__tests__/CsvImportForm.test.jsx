import React from 'react'
import renderer from 'react-test-renderer'
import CsvImportForm from '../CsvImportForm'

describe('CsvImportForm', () => {
  const mockHandleSubmit = jest.fn()
  const mockHandleChange = jest.fn()
  const mockOnCancel = jest.fn()

  const props = {
    classes: { }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot for BMO', () => {
    const component = renderer.create((
      <CsvImportForm
        handleSubmit={mockHandleSubmit}
        handleChange={mockHandleChange}
        onCancel={mockOnCancel}
        isSubmitting={false}
        institution="BMO"
        values={{ ticker: 'CAD' }}
        classes={{ ...props }}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
