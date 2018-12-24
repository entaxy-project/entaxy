import React from 'react'
import renderer from 'react-test-renderer'
import CsvImportFields from '../CsvImportFields'

describe('CsvImportFields', () => {
  const mockHandleChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot for BMO', () => {
    const component = renderer.create((
      <CsvImportFields
        handleChange={mockHandleChange}
        institution="BMO"
        values={{ ticker: 'CAD' }}
        classes={{ }}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot for TD', () => {
    const component = renderer.create((
      <CsvImportFields
        handleChange={mockHandleChange}
        institution="TD"
        values={{ ticker: 'CAD' }}
        classes={{ }}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot for Tangerine', () => {
    const component = renderer.create((
      <CsvImportFields
        handleChange={mockHandleChange}
        institution="Tangerine"
        values={{ ticker: 'CAD' }}
        classes={{ }}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
