import React from 'react'
import {
  render,
  cleanup,
  fireEvent,
  waitForElement
} from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { MemoryRouter, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from '../../../../store'
import ImportTransactions from '..'
import { createAccount } from '../../../../store/accounts/actions'
import ThemeProvider from '../../../ThemeProvider'

jest.mock('../../../../common/InstitutionIcon/importLogos', () => [])

// Mock call to alphavantage in fetchExchangeRates
window.fetch = jest.fn().mockImplementation(() => (
  Promise.resolve(new window.Response(
    JSON.stringify({
      'Realtime Currency Exchange Rate': {
        '6. Last Refreshed': '2018-01-01',
        '5. Exchange Rate': 1
      }
    }), {
      status: 200,
      headers: { 'Content-type': 'application/json' }
    }
  ))
))

const account = {
  institution: 'TD',
  name: 'checking',
  groupId: '0',
  description: 'Checking',
  currency: 'CAD',
  openingBalance: 10,
  currentBalance: {
    accountCurrency: 10,
    localCurrency: null
  }
}

beforeEach(async () => {
  // Add one account to the store
  account.id = await store.dispatch(createAccount(account))
})

afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})

describe('Import Transactions', () => {
  it('finds the right account from the url', () => {
    const { getByText } = render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter initialEntries={[`/accounts/${account.id}/import/CSV`]} initialIndex={0}>
            <Route
              component={(props) => <ImportTransactions {...props} />}
              path="/accounts/:accountId/import/:importType"
            />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    )
    expect(getByText(`Import transactions from ${account.institution}`)).toBeInTheDocument()
  })

  it('should run through all steps', async () => {
    const csvData = [
      'First Bank Card,Transaction Type,Date Posted, Transaction Amount,Description',
      '\'500766**********\',DEBIT,20180628,-650.0,[SO]2211#8503-567 ',
      '\'500766**********\',CREDIT,20180629,2595.11,[DN]THE WORKING GRO PAY/PAY  '
    ]
    const file = new File([csvData.join('\n')], 'test.csv', { type: 'text/csv' })
    const { getByText, getByTestId, queryByTestId } = render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter initialEntries={[`/accounts/${account.id}/import/CSV`]} initialIndex={0}>
            <Route
              component={(props) => <ImportTransactions {...props} />}
              path="/accounts/:accountId/import/:importType"
            />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    )
    expect(getByTestId('activeStep').children[1].children[0].innerHTML).toEqual('Upload CSV file')
    // Go to step 2
    fireEvent.change(getByTestId('dopzone-input'), { target: { files: [file] } })
    await waitForElement(() => getByText('Filename:'))
    expect(getByTestId('activeStep').children[1].children[0].innerHTML).toEqual('Select columns to import')
    // Back to step 1
    fireEvent.click(getByTestId('backButton'))
    expect(getByTestId('activeStep').children[1].children[0].innerHTML).toEqual('Upload CSV file')
    // Go to step 2
    fireEvent.change(getByTestId('dopzone-input'), { target: { files: [file] } })
    await waitForElement(() => getByText('Filename:'))
    expect(getByTestId('activeStep').children[1].children[0].innerHTML).toEqual('Select columns to import')
    // Go to step 3
    fireEvent.click(getByTestId('nextButton'))
    expect(getByTestId('activeStep').children[1].children[0].innerHTML).toEqual('Review data')
    // Back to step 2
    fireEvent.click(getByTestId('backButton'))
    expect(getByTestId('activeStep').children[1].children[0].innerHTML).toEqual('Select columns to import')
    // Go to step 3
    fireEvent.click(getByTestId('nextButton'))
    expect(getByTestId('activeStep').children[1].children[0].innerHTML).toEqual('Review data')
    // Save
    fireEvent.click(getByTestId('saveButton'))
    await waitForElement(() => queryByTestId('activeStep'))
    expect(store.getState().transactions.list.length).toBe(csvData.length - 1)
    expect(queryByTestId('activeStep')).not.toBeInTheDocument()
  })
})
