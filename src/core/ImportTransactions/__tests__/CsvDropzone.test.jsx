import React from 'react'
import renderer from 'react-test-renderer'
import CsvDropzone from '../CsvDropzone'

describe('CsvDropzone', () => {
  const mockHandleFileUpload = jest.fn()
  const props = {
    classes: { }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot', () => {
    const component = renderer.create((
      <CsvDropzone
        handleFileUpload={mockHandleFileUpload}
        classes={{ ...props }}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
