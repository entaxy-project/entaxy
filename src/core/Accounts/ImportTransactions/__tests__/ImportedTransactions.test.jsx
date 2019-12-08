import React from 'react'
import { render, cleanup, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import ImportedTransactions from '../ImportedTransactions'
import CsvParser from '../../../../store/transactions/CsvParsers/CsvParser'
import { initialState as settingsInitialState } from '../../../../store/settings/reducer'
import { initialState as accountsInitialState } from '../../../../store/accounts/reducer'
import { initialState as budgetInitialState } from '../../../../store/budget/reducer'
import ThemeProvider from '../../../ThemeProvider'

const mockHandlePrevStep = jest.fn()
const mockHandleNextStep = jest.fn()
const mochHandleGenerateTransactions = jest.fn()
const mockStore = configureMockStore()

const account = {
  id: 1,
  name: 'Checking',
  institution: 'TD',
  currency: 'CAD'
}

const csvData = [
  'First Bank Card,Transaction Type,Date Posted, Transaction Amount,Description',
  '\'500766**********\',DEBIT,20180628,-650.0,[SO]2211#8503-567 ',
  '\'500766**********\',CREDIT,20180629,2595.11,[DN]THE WORKING GRO PAY/PAY  '
]

afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})

const renderContent = async (data = csvData) => {
  const store = mockStore({
    settings: settingsInitialState,
    accounts: accountsInitialState,
    budget: budgetInitialState
  })

  const file = new File([data.join('\n')], 'test.csv', { type: 'text/csv' })
  const props = {
    account,
    parser: new CsvParser({}),
    handlePrevStep: mockHandlePrevStep,
    handleNextStep: mockHandleNextStep,
    handleGenerateTransactions: mochHandleGenerateTransactions,
    isGeneratingTransactions: false

  }
  await props.parser.parse(file)
  props.parser.mapToTransactions()
  return {
    ...render(
      <Provider store={store}>
        <ThemeProvider>
          <ImportedTransactions {...props} />
        </ThemeProvider>
      </Provider>
    ),
    props,
    store
  }
}

describe('ImportedTransactions', () => {
  it('renders correctly with no transaction errors', async () => {
    const { props } = await renderContent()
    expect(props.parser.transactions.length).toBe(csvData.length - 1)
    expect(props.parser.errors).toEqual({ base: [], transactions: {} })
  })

  it('renders correctly and opens error popup', async () => {
    const data = csvData
    data.push('bogus')
    const {
      props,
      getByText,
      getByTestId,
      queryByTestId
    } = await renderContent(data)
    expect(props.parser.transactions[2].errors).toEqual(['Invalid date. Expecting format \'yyyymmdd\''])
    expect(queryByTestId('closeIconButton')).not.toBeInTheDocument()

    fireEvent.click(getByTestId('errorIconButton'))
    getByText(`Line ${props.parser.transactions[2].line} has an error`)

    fireEvent.click(getByTestId('closeIconButton'))
    expect(queryByTestId('closeIconButton')).not.toBeInTheDocument()
  })

  it('should change invert amount', async () => {
    const { props, getByLabelText } = await renderContent()
    const checkbox = getByLabelText('Invert amount')
    expect(props.parser.invertAmount).toBe(false)
    expect(checkbox.checked).toBe(false)

    fireEvent.click(checkbox)
    expect(props.parser.invertAmount).toBe(true)
    expect(checkbox.checked).toBe(true)

    fireEvent.click(checkbox)
    expect(props.parser.invertAmount).toBe(false)
    expect(checkbox.checked).toBe(false)
  })
})
