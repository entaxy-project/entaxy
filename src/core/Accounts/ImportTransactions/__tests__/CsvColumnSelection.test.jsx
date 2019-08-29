import React from 'react'
import { render, cleanup, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import CsvColumnSelection from '../CsvColumnSelection'
import CsvParser from '../../../../store/transactions/CsvParsers/CsvParser'
import ThemeProvider from '../../../ThemeProvider'

const mockHandlePrevStep = jest.fn()
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

describe('CsvColumnSelection', () => {
  it('renders correctly', async () => {
    const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
    const props = {
      parser: new CsvParser(),
      handlePrevStep: mockHandlePrevStep,
      handleNextStep: mockHandleNextStep
    }
    await props.parser.parse(file)
    const { getByText } = render(
      <ThemeProvider>
        <CsvColumnSelection {...props} />
      </ThemeProvider>
    )

    expect(getByText('Filename:')).toBeDefined()
    expect(getByText('test.csv')).toBeDefined()
    expect(getByText(`(${csvData.length} lines)`)).toBeDefined()
  })

  it('should change header row existance', async () => {
    const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
    const props = {
      parser: new CsvParser(),
      handlePrevStep: mockHandlePrevStep,
      handleNextStep: mockHandleNextStep
    }
    await props.parser.parse(file)
    const { getByLabelText, getByTestId, queryByTestId } = render(
      <ThemeProvider>
        <CsvColumnSelection {...props} />
      </ThemeProvider>
    )
    const checkbox = getByLabelText('This file has a header row')
    expect(props.parser.hasHeaderRow).toBe(true)
    expect(checkbox.checked).toBe(true)
    expect(getByTestId('headerRow')).toBeInTheDocument()

    fireEvent.click(checkbox)
    expect(props.parser.hasHeaderRow).toBe(false)
    expect(checkbox.checked).toBe(false)
    expect(queryByTestId('headerRow')).not.toBeInTheDocument()

    fireEvent.click(checkbox)
    expect(props.parser.hasHeaderRow).toBe(true)
    expect(checkbox.checked).toBe(true)
    expect(getByTestId('headerRow')).toBeInTheDocument()
  })

  it('should change the date format', async () => {
    const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
    const props = {
      parser: new CsvParser(),
      handlePrevStep: mockHandlePrevStep,
      handleNextStep: mockHandleNextStep
    }
    await props.parser.parse(file)
    const { getByText, getByTestId } = render(
      <ThemeProvider>
        <CsvColumnSelection {...props} />
      </ThemeProvider>
    )
    const dateFormatDropdown = getByTestId('dateFormatDropdown')
    const dateFormatInput = getByTestId('dateFormatInput')
    expect(props.parser.dateFormat).toBe(props.parser.dateFormats[1])
    expect(dateFormatInput.value).toEqual(props.parser.dateFormat)
    fireEvent.click(dateFormatDropdown)
    fireEvent.click(getByText(props.parser.dateFormats[0]))
    expect(props.parser.dateFormat).toBe(props.parser.dateFormats[0])
    expect(dateFormatInput.value).toEqual(props.parser.dateFormat)
  })

  it('should change the selected columns', async () => {
    const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
    const props = {
      parser: new CsvParser(),
      handlePrevStep: mockHandlePrevStep,
      handleNextStep: mockHandleNextStep
    }
    await props.parser.parse(file)
    const { getAllByText } = render(
      <ThemeProvider>
        <CsvColumnSelection {...props} />
      </ThemeProvider>
    )

    expect(props.parser.csvHeader[0].transactionField).toEqual(props.parser.dontImport)
    expect(props.parser.csvHeader[4].transactionField).toEqual('description1')
    fireEvent.click(getAllByText(props.parser.dontImport)[0])
    fireEvent.click(getAllByText('Description 1')[1])
    expect(props.parser.csvHeader[0].transactionField).toEqual('description1')
    expect(props.parser.csvHeader[4].transactionField).toEqual(props.parser.dontImport)
  })

  it('should handle submit', async () => {
    const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
    const props = {
      parser: new CsvParser({}),
      handlePrevStep: mockHandlePrevStep,
      handleNextStep: mockHandleNextStep
    }
    await props.parser.parse(file)
    const { getByTestId } = render(
      <ThemeProvider>
        <CsvColumnSelection {...props} />
      </ThemeProvider>
    )

    expect(props.parser.transactions.length).toBe(0)
    fireEvent.click(getByTestId('nextButton'))
    expect(mockHandleNextStep).toHaveBeenCalled()
    expect(props.parser.transactions.length).toBe(2)
  })

  it('should handle back', async () => {
    const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
    const props = {
      parser: new CsvParser({}),
      handlePrevStep: mockHandlePrevStep,
      handleNextStep: mockHandleNextStep
    }
    await props.parser.parse(file)
    const { getByTestId } = render(
      <ThemeProvider>
        <CsvColumnSelection {...props} />
      </ThemeProvider>
    )

    fireEvent.click(getByTestId('backButton'))
    expect(mockHandlePrevStep).toHaveBeenCalled()
  })
})
