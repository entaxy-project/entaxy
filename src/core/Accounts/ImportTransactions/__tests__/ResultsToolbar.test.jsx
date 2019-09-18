import React from 'react'
import { render, cleanup, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import ResultsToolbar from '../ResultsToolbar'

const account = { id: 1, name: 'Checking', institution: 'TD' }
const mockHandleNextStep = jest.fn()
const mockHandlePrevStep = jest.fn()
const mochaSetFilter = jest.fn()
const mochaUnsetFilter = jest.fn()

afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})

describe('ResultsToolbar', () => {
  it('it renders correctly', () => {
    const props = {
      title: 'Title',
      subTitle: 'subTitle',
      account,
      selectedTransactions: [],
      filterProps: { filters: {} },
      handleNextStep: mockHandleNextStep,
      handlePrevStep: mockHandlePrevStep
    }
    const { getByText } = render(<ResultsToolbar {...props} />)
    getByText('Title')
    getByText('subTitle')
  })

  it('should show/hide only transactions with errors', async () => {
    const props = {
      title: 'Title',
      subTitle: 'subTitle',
      account,
      selectedTransactions: [],
      filterProps: {
        filters: {},
        setFilter: mochaSetFilter,
        unsetFilter: mochaUnsetFilter
      },
      handleNextStep: mockHandleNextStep,
      handlePrevStep: mockHandlePrevStep
    }
    const { getByTestId } = render(<ResultsToolbar {...props} />)

    const checkbox = getByTestId('showOnlyErrors')
    expect(checkbox.checked).toBe(false)

    fireEvent.click(checkbox)
    expect(mochaSetFilter).toHaveBeenCalledWith({ attr: 'errors', value: true })
    expect(checkbox.checked).toBe(true)

    fireEvent.click(checkbox)
    expect(mochaUnsetFilter).toHaveBeenCalledWith({ attr: 'errors' })
  })

  it('should handle submit', async () => {
    const props = {
      title: 'Title',
      subTitle: 'subTitle',
      account,
      selectedTransactions: [],
      filterProps: { filters: {} },
      handleNextStep: mockHandleNextStep,
      handlePrevStep: mockHandlePrevStep
    }
    const { getByTestId } = render(<ResultsToolbar {...props} />)
    fireEvent.click(getByTestId('saveButton'))
    expect(mockHandleNextStep).toHaveBeenCalled()
  })

  it('should handle back', async () => {
    const props = {
      title: 'Title',
      subTitle: 'subTitle',
      account,
      selectedTransactions: [],
      filterProps: { filters: {} },
      handleNextStep: mockHandleNextStep,
      handlePrevStep: mockHandlePrevStep
    }
    const { getByTestId } = render(<ResultsToolbar {...props} />)
    fireEvent.click(getByTestId('backButton'))
    expect(mockHandlePrevStep).toHaveBeenCalled()
  })
})
