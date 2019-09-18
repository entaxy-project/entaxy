import React from 'react'
import { render, cleanup, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import ImportedTransactions from '../ImportedTransactions'
import CsvParser from '../../../../store/transactions/CsvParsers/CsvParser'
import { initialState as settingsInitialState } from '../../../../store/settings/reducer'
import { initialState as budgetInitialState } from '../../../../store/budget/reducer'
import ThemeProvider from '../../../ThemeProvider'

const mockHandlePrevStep = jest.fn()
const mockHandleNextStep = jest.fn()
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

const renderContent = async (store, csvData) => {
  const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
  const props = {
    account,
    parser: new CsvParser({}),
    handlePrevStep: mockHandlePrevStep,
    handleNextStep: mockHandleNextStep
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
    props
  }
}

describe('ImportedTransactions', () => {
  it('renders correctly with no transaction errors', async () => {
    const csvData = [
      'First Bank Card,Transaction Type,Date Posted, Transaction Amount,Description',
      '\'500766**********\',DEBIT,20180628,-650.0,[SO]2211#8503-567 ',
      '\'500766**********\',CREDIT,20180629,2595.11,[DN]THE WORKING GRO PAY/PAY  '
    ]
    const mockStore = configureMockStore()
    const store = mockStore({
      settings: settingsInitialState,
      budget: budgetInitialState
    })
    const { props } = await renderContent(store, csvData)
    expect(props.parser.transactions.length).toBe(csvData.length - 1)
    expect(props.parser.errors).toEqual({ base: [], transactions: {} })
  })

  it('renders correctly and opens error popup', async () => {
    const csvData = [
      'First Bank Card,Transaction Type,Date Posted, Transaction Amount,Description',
      '\'500766**********\',DEBIT,20180628,-650.0,[SO]2211#8503-567 ',
      '\'500766**********\',CREDIT,20180629,2595.11,[DN]THE WORKING GRO PAY/PAY  ',
      'bogus'
    ]
    const mockStore = configureMockStore()
    const store = mockStore({
      settings: settingsInitialState,
      budget: budgetInitialState
    })
    const {
      props,
      getByText,
      getByTestId,
      queryByTestId
    } = await renderContent(store, csvData)
    expect(props.parser.transactions[2].errors).toEqual(['Could not read the amount'])
    expect(queryByTestId('closeIconButton')).not.toBeInTheDocument()

    fireEvent.click(getByTestId('errorIconButton'))
    getByText(`Line ${props.parser.transactions[2].line} has an error`)

    fireEvent.click(getByTestId('closeIconButton'))
    expect(queryByTestId('closeIconButton')).not.toBeInTheDocument()
  })

  it('renders correctly and opens duplicate popup', async () => {
    const csvData = [
      'First Bank Card,Transaction Type,Date Posted, Transaction Amount,Description',
      '\'500766**********\',DEBIT,20180628,-650.0,[SO]2211#8503-567 ',
      '\'500766**********\',CREDIT,20180629,2595.11,[DN]THE WORKING GRO PAY/PAY  ',
      'bogus'
    ]
    const mockStore = configureMockStore()
    const store = mockStore({
      settings: settingsInitialState,
      budget: budgetInitialState
    })
    const {
      props,
      getByText,
      getByTestId,
      queryByTestId
    } = await renderContent(store, csvData)
    expect(props.parser.transactions[2].errors).toEqual(['Could not read the amount'])
    expect(queryByTestId('closeIconButton')).not.toBeInTheDocument()

    fireEvent.click(getByTestId('errorIconButton'))
    getByText(`Line ${props.parser.transactions[2].line} has an error`)

    fireEvent.click(getByTestId('closeIconButton'))
    expect(queryByTestId('closeIconButton')).not.toBeInTheDocument()
  })
})
