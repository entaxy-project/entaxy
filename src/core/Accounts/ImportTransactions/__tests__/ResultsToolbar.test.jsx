import React from 'react'
import { render, cleanup, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import ResultsToolbar from '../ResultsToolbar'

const account = { id: 1, name: 'Checking', institution: 'TD' }
const mockHandleNextStep = jest.fn()
const mockHandlePrevStep = jest.fn()
const mochSetFilter = jest.fn()
const mochUnsetFilter = jest.fn()
const mochHandleChangeInvertAmount = jest.fn()

afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})

const renderContent = () => {
  const props = {
    title: 'Title',
    subTitle: 'subTitle',
    account,
    selectedTransactions: [],
    filterProps: {
      filters: {},
      setFilter: mochSetFilter,
      unsetFilter: mochUnsetFilter
    },
    handleNextStep: mockHandleNextStep,
    handlePrevStep: mockHandlePrevStep,
    invertAmount: false,
    handleChangeInvertAmount: mochHandleChangeInvertAmount,
    isGeneratingTransactions: false

  }
  return {
    ...render(<ResultsToolbar {...props} />),
    props
  }
}

describe('ResultsToolbar', () => {
  it('it renders correctly', () => {
    const { getByText } = renderContent()
    getByText('Title')
    getByText('subTitle')
  })

  it('should show/hide only transactions with errors', async () => {
    const { getByTestId } = renderContent()
    const checkbox = getByTestId('showOnlyErrors')
    expect(checkbox.checked).toBe(false)

    fireEvent.click(checkbox)
    expect(mochSetFilter).toHaveBeenCalledWith({ attr: 'errors', value: true })
    expect(checkbox.checked).toBe(true)

    fireEvent.click(checkbox)
    expect(mochUnsetFilter).toHaveBeenCalledWith({ attr: 'errors' })
  })

  it('should handle submit', async () => {
    const { getByTestId } = renderContent()
    fireEvent.click(getByTestId('saveButton'))
    expect(mockHandleNextStep).toHaveBeenCalled()
  })

  it('should handle back', async () => {
    const { getByTestId } = renderContent()
    fireEvent.click(getByTestId('backButton'))
    expect(mockHandlePrevStep).toHaveBeenCalled()
  })
})
