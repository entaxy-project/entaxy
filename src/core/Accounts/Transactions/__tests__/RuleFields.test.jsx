import React from 'react'
import { render, queryByAttribute } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import configureMockStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import RuleFields from '../RuleFields'
import ThemeProvider from '../../../ThemeProvider'
import { initialState as settingsInitialState } from '../../../../store/settings/reducer'
import { initialState as transactionsInitialState } from '../../../../store/transactions/reducer'
import { initialState as budgetInitialState } from '../../../../store/budget/reducer'

const getByName = queryByAttribute.bind(null, 'name')

const mockHandleChange = jest.fn()
const mockSetFieldValue = jest.fn()
const mockToggleShowTransactions = jest.fn()

const defaultValues = {
  ruleType: 'equals',
  transactionType: 'expense',
  applyToOtherTransactions: true,
  applyToExisting: true,
  applyToFuture: true
}

const renderContent = (props) => {
  const mockStore = configureMockStore()
  const store = mockStore({
    transactions: transactionsInitialState,
    settings: settingsInitialState,
    budget: budgetInitialState
  })

  const newProps = {
    transaction: null,
    values: defaultValues,
    errors: {},
    touched: {},
    handleChange: mockHandleChange,
    setFieldValue: mockSetFieldValue,
    filteredTransactions: [],
    toggleShowTransactions: mockToggleShowTransactions,
    showTransactions: false,
    ...props
  }
  return {
    ...render(
      <Provider store={store}>
        <ThemeProvider>
          <RuleFields {...newProps} />
        </ThemeProvider>
      </Provider>
    ),
    props
  }
}

describe('RuleFields', () => {
  describe('transaction without ruleId', () => {
    it('should disable all fields if no category selected', () => {
      const { getByText, container } = renderContent()
      expect(getByText('Apply this category to')).toBeInTheDocument()
      expect(getByText('0 other existing transactions')).toBeInTheDocument()
      expect(getByName(container, 'applyToOtherTransactions')).toHaveProperty('disabled', true)
      expect(getByName(container, 'applyToExisting')).toHaveProperty('disabled', true)
      expect(getByName(container, 'applyToFuture')).toHaveProperty('disabled', true)
      expect(getByName(container, 'filterText')).not.toBeInTheDocument()
      expect(getByName(container, 'matchAmount')).toHaveProperty('disabled', true)
      expect(getByName(container, 'applyToOtherTransactions')).toHaveProperty('checked', true)
      expect(getByName(container, 'applyToExisting')).toHaveProperty('checked', true)
      expect(getByName(container, 'applyToFuture')).toHaveProperty('checked', true)
    })

    it('should enable some fields if a category is selected', async () => {
      const categoryId = budgetInitialState.categoryTree[0].options[0].id
      const { getByText, container } = renderContent({ values: { ...defaultValues, categoryId } })
      expect(getByText('Apply this category to')).toBeInTheDocument()
      expect(getByText('0 other existing transactions')).toBeInTheDocument()
      expect(getByName(container, 'applyToOtherTransactions')).toHaveProperty('disabled', false)
      expect(getByName(container, 'applyToExisting')).toHaveProperty('disabled', true)
      expect(getByName(container, 'applyToFuture')).toHaveProperty('disabled', false)
      expect(getByName(container, 'filterText')).not.toBeInTheDocument()
      expect(getByName(container, 'matchAmount')).toHaveProperty('disabled', false)
    })

    it('should disable all fields if no account is selected', () => {
      const { getByText, container } = renderContent({ values: { ...defaultValues, transactionType: 'transfer' } })
      expect(getByText('Apply this transfer to')).toBeInTheDocument()
      expect(getByText('0 other existing transactions')).toBeInTheDocument()
      expect(getByName(container, 'applyToOtherTransactions')).toHaveProperty('disabled', true)
      expect(getByName(container, 'applyToExisting')).toHaveProperty('disabled', true)
      expect(getByName(container, 'applyToFuture')).toHaveProperty('disabled', true)
      expect(getByName(container, 'filterText')).not.toBeInTheDocument()
      expect(getByName(container, 'matchAmount')).toHaveProperty('disabled', true)
    })
  })
})
