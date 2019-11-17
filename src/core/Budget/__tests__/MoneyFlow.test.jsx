import React from 'react'
import {
  render,
  cleanup,
  fireEvent
} from '@testing-library/react'
import matchMediaPolyfill from 'mq-polyfill'
import '@testing-library/jest-dom/extend-expect'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'
import {
  format,
  startOfMonth,
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns'
import MoneyFlow from '../MoneyFlow'
import { initialState as budgetInitialState } from '../../../store/budget/reducer'
import { initialState as transactionsInitialState } from '../../../store/transactions/reducer'
import { initialState as settingsInitialState } from '../../../store/settings/reducer'

beforeAll(() => {
  matchMediaPolyfill(window)
  window.resizeTo = function resizeTo(width, height) {
    Object.assign(this, {
      innerWidth: width,
      innerHeight: height,
      outerWidth: width,
      outerHeight: height
    }).dispatchEvent(new this.Event('resize'))
  }
})

afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})

const mockStore = configureMockStore([thunk])

describe('MoneyFlow', () => {
  it('no transactions and no budget rules', async () => {
    const store = mockStore({
      settings: settingsInitialState,
      budget: budgetInitialState,
      transactions: transactionsInitialState
    })
    const { getByText, queryAllByText } = render(
      <Provider store={store}>
        <MoneyFlow />
      </Provider>
    )

    expect(getByText('Money flow')).toBeInTheDocument()
    expect(getByText('Not enough data to generate chart')).toBeInTheDocument()
    const nodes = queryAllByText((content, node) => node.getAttribute('data-type') === 'node')
    const links = queryAllByText((content, node) => node.getAttribute('data-type') === 'link')
    expect(nodes.length).toBe(0)
    expect(links.length).toBe(0)
  })

  it('transactions but no budget rules', async () => {
    const store = mockStore({
      settings: settingsInitialState,
      budget: budgetInitialState,
      transactions: {
        ...transactionsInitialState,
        list: [
          { id: 1, createdAt: new Date(), amount: 10 },
          { id: 2, createdAt: new Date(), amount: 20 }
        ]
      }
    })
    const { getByText, queryAllByText } = render(
      <Provider store={store}>
        <MoneyFlow />
      </Provider>
    )

    expect(getByText('Money flow')).toBeInTheDocument()
    expect(getByText('Not enough data to generate chart')).toBeInTheDocument()
    const nodes = queryAllByText((content, node) => node.getAttribute('data-type') === 'node')
    const links = queryAllByText((content, node) => node.getAttribute('data-type') === 'link')
    expect(nodes.length).toBe(0)
    expect(links.length).toBe(0)
  })

  it('budget rules but no transactions', async () => {
    const category = budgetInitialState.categoryTree[0].options[0]
    const store = mockStore({
      settings: settingsInitialState,
      budget: {
        ...budgetInitialState,
        rules: { 'Test Grocery store': category.name }
      },
      transactions: transactionsInitialState
    })
    const { getByText, queryAllByText } = render(
      <Provider store={store}>
        <MoneyFlow />
      </Provider>
    )

    expect(getByText('Money flow')).toBeInTheDocument()
    expect(getByText('Not enough data to generate chart')).toBeInTheDocument()
    const nodes = queryAllByText((content, node) => node.getAttribute('data-type') === 'node')
    const links = queryAllByText((content, node) => node.getAttribute('data-type') === 'link')
    expect(nodes.length).toBe(0)
    expect(links.length).toBe(0)
  })

  it('budget rules and transactions but no Income group', async () => {
    const group = budgetInitialState.categoryTree[0]
    const category = group.options[0]
    expect(group.label).not.toBe('Income')
    const store = mockStore({
      settings: settingsInitialState,
      budget: {
        ...budgetInitialState,
        rules: { 'Test Grocery store': category.name }
      },
      transactions: {
        ...transactionsInitialState,
        list: [
          {
            id: 1,
            createdAt: new Date(),
            amount: 10,
            categoryId: category.id
          }, {
            id: 2,
            createdAt: new Date(),
            amount: 20,
            categoryId: category.id
          }
        ]
      }
    })
    const getBoundingClientRectSpy = jest.fn(() => ({ width: 100 }))
    global.document.getElementById = jest.fn(() => ({
      getBoundingClientRect: getBoundingClientRectSpy
    }))
    const { getByText, queryByText, queryAllByText } = render(
      <Provider store={store}>
        <MoneyFlow />
      </Provider>
    )

    expect(getByText('Money flow')).toBeInTheDocument()
    expect(queryByText('Not enough data to generate chart')).not.toBeInTheDocument()
    const nodes = queryAllByText((content, node) => node.getAttribute('data-type') === 'node')
    const links = queryAllByText((content, node) => node.getAttribute('data-type') === 'link')
    expect(nodes.length).toBe(4)
    expect(links.length).toBe(3)
  })

  it('budget rules and transactions and Income group', async () => {
    const incomeGroup = budgetInitialState.categoryTree.find((group) => group.isIncome)
    const group = budgetInitialState.categoryTree[0]
    const category = group.options[0]
    expect(group.label).not.toBe('Income')
    const store = mockStore({
      settings: settingsInitialState,
      budget: {
        ...budgetInitialState,
        rules: {
          'Test Grocery store': category.name,
          Paycheque: incomeGroup.options[0].name
        }
      },
      transactions: {
        ...transactionsInitialState,
        list: [
          {
            id: 1,
            createdAt: new Date(),
            amount: 10,
            categoryId: category.id
          }, {
            id: 2,
            createdAt: new Date(),
            amount: 20,
            categoryId: category.id
          }, {
            id: 3,
            createdAt: new Date(),
            amount: 30,
            categoryId: incomeGroup.options[0].id
          }
        ]
      }
    })
    const { getByText, queryByText, getAllByText } = render(
      <Provider store={store}>
        <MoneyFlow />
      </Provider>
    )

    expect(getByText('Money flow')).toBeInTheDocument()
    expect(queryByText('Not enough data to generate chart')).not.toBeInTheDocument()
    const nodes = getAllByText((content, node) => node.getAttribute('data-type') === 'node')
    const links = getAllByText((content, node) => node.getAttribute('data-type') === 'link')
    expect(nodes.length).toBe(5)
    expect(links.length).toBe(4)
  })

  it('handles date selection', async () => {
    const incomeGroup = budgetInitialState.categoryTree.find((group) => group.isIncome)
    const group = budgetInitialState.categoryTree[1]
    expect(group.label).not.toBe('Income')
    expect(group.options.length).toBeGreaterThan(3)

    const store = mockStore({
      settings: settingsInitialState,
      budget: {
        ...budgetInitialState,
        rules: { Paycheque: incomeGroup.options[0].name }
      },
      transactions: {
        ...transactionsInitialState,
        list: [
          ...group.options.map((category, index) => ({
            id: index + 1,
            createdAt: subMonths(new Date(), index).getTime(),
            amount: (index + 1) * 10,
            categoryId: category.id
          })),
          {
            id: 4,
            createdAt: new Date().getTime(),
            amount: 50,
            categoryId: incomeGroup.options[0].id
          }
        ]
      }
    })
    const {
      getByText,
      queryByText,
      getAllByText,
      getByTestId
    } = render(
      <Provider store={store}>
        <MoneyFlow />
      </Provider>
    )
    const transactions = store.getState().transactions.list.sort((a, b) => a.createdAt - b.createdAt)

    expect(getByText('Money flow')).toBeInTheDocument()
    expect(queryByText('Not enough data to generate chart')).not.toBeInTheDocument()
    let nodes = getAllByText((content, node) => node.getAttribute('data-type') === 'node')
    let links = getAllByText((content, node) => node.getAttribute('data-type') === 'link')
    expect(nodes.length).toBe(3 + 3 + 2) // 3 categories + 3 groups + income + expenses
    expect(links.length).toBe(3 + 1 + 1 + 1 + 1) // 3 categories + 1 income cat + 1 group + income + expenses

    // const minDate = new Date(transactions[0].createdAt)
    const maxDate = new Date(transactions[transactions.length - 1].createdAt)
    const startDate = subMonths(startOfMonth(maxDate), 3)
    const endDate = maxDate
    let buttonText = `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`
    expect(getByText(buttonText)).toBeInTheDocument()
    const button = getByTestId('DateRangeButton')

    // Select another start month
    fireEvent.click(button)
    fireEvent.click(getByText('This Week'))
    buttonText = `${format(startOfWeek(new Date()), 'MMM dd, yyyy')} - ${format(endOfWeek(new Date()), 'MMM dd, yyyy')}`
    expect(getByText(buttonText)).toBeInTheDocument()

    nodes = getAllByText((content, node) => node.getAttribute('data-type') === 'node')
    links = getAllByText((content, node) => node.getAttribute('data-type') === 'link')
    expect(nodes.length).toBe(1 + 1 + 1 + 2) // 1 category + 1 income cat + 1 groups + income + expenses
    expect(links.length).toBe(1 + 1 + 2) // 1 category + 1 income cat + 1 group + income + expenses
  })
})
