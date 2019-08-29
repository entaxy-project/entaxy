import React from 'react'
import {
  render,
  cleanup,
  fireEvent,
  waitForElement
} from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import CsvDropzone from '../CsvDropzone'
import CsvParser from '../../../../store/transactions/CsvParsers/CsvParser'

const mockHandleNextStep = jest.fn()
const csvData = [
  'First Bank Card,Transaction Type,Date Posted, Transaction Amount,Description',
  '\'500766**********\',DEBIT,20180628,-650.0,[SO]2211#8503-567 ',
  '\'500766**********\',CREDIT,20180629,2595.11,[DN]THE WORKING GRO PAY/PAY  '
]

afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})

describe('CsvDropzone', () => {
  it('renders without a file', () => {
    const props = {
      parser: new CsvParser(),
      handleNextStep: mockHandleNextStep
    }
    const { getByText } = render(<CsvDropzone {...props} />)
    expect(getByText('Drag a CSV file here')).toBeInTheDocument()
  })

  it('should handleFileUpload', async () => {
    const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
    const props = {
      parser: new CsvParser(),
      handleNextStep: mockHandleNextStep
    }
    const { getByText, getByTestId } = render(<CsvDropzone {...props} />)
    const input = getByTestId('dopzone-input')
    fireEvent.change(input, { target: { files: [file] } })
    expect(getByText('Drag a CSV file here')).toBeInTheDocument()
    await waitForElement(() => getByText('Reading file ...'))
    expect(mockHandleNextStep).toHaveBeenCalled()
  })

  it('should handleFileUpload with a bad file', async () => {
    const file = new File([csvData.join('\n')], 'test.csv', { type: 'bogus' })
    const props = {
      parser: new CsvParser(),
      handleNextStep: mockHandleNextStep
    }
    const { getByText, getByTestId } = render(<CsvDropzone {...props} />)
    const input = getByTestId('dopzone-input')
    fireEvent.change(input, { target: { files: [file] } })
    expect(getByText('Drag a CSV file here')).toBeInTheDocument()
    await waitForElement(() => getByText('The file you uploaded is not a CSV file'))
    expect(mockHandleNextStep).not.toHaveBeenCalled()
  })
})
