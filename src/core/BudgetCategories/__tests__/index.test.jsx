import React from 'react'
import {
  render,
  cleanup
} from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import ThemeProvider from '../../ThemeProvider'
import BudgetCategories from '..'
import { store } from '../../../store'

afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})

describe('CsvDropzone', () => {
  it('renders correctly', () => {
    const props = {
    }
    const { getByText } = render(
      <Provider store={store}>
        <ThemeProvider>
          <BrowserRouter>
            <BudgetCategories {...props} />
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    )
    expect(getByText('Manage categories')).toBeInTheDocument()
    //     const groupNames = budgetInitialState.categoryTree.map((cat) => cat.label)
    //     expect(wrapper.find('h6').map((node) => node.text())).toEqual(groupNames)
  })
})
