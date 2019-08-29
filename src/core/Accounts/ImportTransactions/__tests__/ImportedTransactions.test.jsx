import React from 'react'
import { render, cleanup, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { Provider } from 'react-redux'
import ImportedTransactions from '../ImportedTransactions'
import CsvParser from '../../../../store/transactions/CsvParsers/CsvParser'
import store from '../../../../store'
import ThemeProvider from '../../../ThemeProvider'

const mockHandlePrevStep = jest.fn()
const mockOnSave = jest.fn()
const account = {
  id: 1,
  name: 'Checking',
  institution: 'TD',
  currency: 'CAD'
}

afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})

describe('ImportedTransactions', () => {
  it('renders correctly with no transaction errors', async () => {
    const csvData = [
      'First Bank Card,Transaction Type,Date Posted, Transaction Amount,Description',
      '\'500766**********\',DEBIT,20180628,-650.0,[SO]2211#8503-567 ',
      '\'500766**********\',CREDIT,20180629,2595.11,[DN]THE WORKING GRO PAY/PAY  '
    ]
    const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
    const props = {
      account,
      parser: new CsvParser({}),
      handlePrevStep: mockHandlePrevStep,
      onSave: mockOnSave
    }
    await props.parser.parse(file)
    props.parser.mapToTransactions()
    const { getByText } = render(
      <Provider store={store}>
        <ThemeProvider>
          <ImportedTransactions {...props} />
        </ThemeProvider>
      </Provider>
    )
    expect(props.parser.transactions.length).toBe(csvData.length - 1)
    expect(getByText(`Found ${props.parser.transactions.length} transactions`)).toBeDefined()
    expect(props.parser.errors).toEqual({ base: [], transactions: {} })
  })

  it('renders correctly and opens error popup', async () => {
    const csvData = [
      'First Bank Card,Transaction Type,Date Posted, Transaction Amount,Description',
      '\'500766**********\',DEBIT,20180628,-650.0,[SO]2211#8503-567 ',
      '\'500766**********\',CREDIT,20180629,2595.11,[DN]THE WORKING GRO PAY/PAY  ',
      'bogus'
    ]
    const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
    const props = {
      account,
      parser: new CsvParser({}),
      handlePrevStep: mockHandlePrevStep,
      onSave: mockOnSave
    }
    await props.parser.parse(file)
    props.parser.mapToTransactions()
    const { getByText, getByTestId, queryByTestId } = render(
      <Provider store={store}>
        <ThemeProvider>
          <ImportedTransactions {...props} />
        </ThemeProvider>
      </Provider>
    )
    expect(getByText(`Found ${props.parser.transactions.length} transactions`)).toBeDefined()
    expect(props.parser.transactions[2].errors).toEqual(['Could not read the amount'])
    expect(queryByTestId('closeIconButton')).not.toBeInTheDocument()

    fireEvent.click(getByTestId('errorIconButton'))
    getByText(`A problem was found with the transaction on line ${props.parser.transactions[2].line}`)

    fireEvent.click(getByTestId('closeIconButton'))
    expect(queryByTestId('closeIconButton')).not.toBeInTheDocument()
  })
})
