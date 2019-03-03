import React from 'react'
import renderer from 'react-test-renderer'
import CsvDropzone from '../CsvDropzone'

describe('CsvDropzone', () => {
  const mockHandleFileUpload = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('matches snapshot without a file', () => {
    const component = renderer.create((
      <CsvDropzone
        handleFileUpload={mockHandleFileUpload}
        classes={{ }}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot with a good file', () => {
    const component = renderer.create((
      <CsvDropzone
        handleFileUpload={mockHandleFileUpload}
        file={{ }}
        classes={{ }}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })

  it('matches snapshot with a bad file', () => {
    const component = renderer.create((
      <CsvDropzone
        handleFileUpload={mockHandleFileUpload}
        file={{ }}
        error="Some error"
        classes={{ }}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
