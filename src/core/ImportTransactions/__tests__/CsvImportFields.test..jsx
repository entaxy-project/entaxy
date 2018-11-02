import React from 'react'
import renderer from 'react-test-renderer'
import CsvImportFields from '../CsvImportFields'

describe('CsvImportFields', () => {
  const mockHandleChange = jest.fn()
  const props = {
    classes: { }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot when institution is not specified', () => {
    const component = renderer.create((
      <CsvImportFields
        handleChange={mockHandleChange}
        classes={{ ...props }}
      />
    ))
    expect(component.toJSON()).toBeNull()
  })

  it('matches snapshot for BMO', () => {
    const component = renderer.create((
      <CsvImportFields
        handleChange={mockHandleChange}
        institution="BMO"
        values={{ ticker: 'CAD' }}
        classes={{ ...props }}
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
        classes={{ ...props }}
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
        classes={{ ...props }}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
