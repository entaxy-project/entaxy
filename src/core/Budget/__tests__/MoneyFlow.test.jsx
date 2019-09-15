import React from 'react'
import {
  render,
  cleanup,
  fireEvent,
  waitForElement
} from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'
import MoneyFlow from '../MoneyFlow'
import { initialState as budgetInitialState } from '../../../store/budget/reducer'
import { initialState as transactionsInitialState } from '../../../store/transactions/reducer'
import { initialState as settingsInitialState } from '../../../store/settings/reducer'

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
    expect(nodes.length).toBe(3)
    expect(links.length).toBe(2)
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
    expect(nodes.length).toBe(4)
    expect(links.length).toBe(3)
  })

  it('handles date selection', async () => {
    const dateFormatter = (new Intl.DateTimeFormat(settingsInitialState.locale, { month: 'long' })).format
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
            createdAt: new Date(`2019-${index + 1}-01 11:00 am`).getTime(),
            amount: (index + 1) * 10,
            categoryId: category.id
          })),
          {
            id: 4,
            createdAt: new Date('2019-01-01 11:00 am').getTime(),
            amount: 50,
            categoryId: incomeGroup.options[0].id
          }
        ]
      }
    })
    const {
      getByText,
      queryByText,
      getAllByText
    } = render(
      <Provider store={store}>
        <MoneyFlow />
      </Provider>
    )

    expect(getByText('Money flow')).toBeInTheDocument()
    expect(queryByText('Not enough data to generate chart')).not.toBeInTheDocument()
    let nodes = getAllByText((content, node) => node.getAttribute('data-type') === 'node')
    let links = getAllByText((content, node) => node.getAttribute('data-type') === 'link')
    expect(nodes.length).toBe(group.options.length + 3)
    expect(links.length).toBe(group.options.length + 2)

    // Check the initial state of the dropodwns
    let fromMonthSelect = getByText((content, elem) => elem.getAttribute('id') === 'fromMonth')
    expect(fromMonthSelect.getAttribute('value')).toBe('January')
    const fromYearSelect = getByText((content, elem) => elem.getAttribute('id') === 'fromYear')
    expect(fromYearSelect.getAttribute('value')).toBe('2019')
    let toMonthSelect = getByText((content, elem) => elem.getAttribute('id') === 'toMonth')
    const toMonth = dateFormatter(new Date(`2019-${group.options.length}-01 11:00 am`).getTime())
    expect(toMonthSelect.getAttribute('value')).toBe(toMonth)
    const toYearSelect = getByText((content, elem) => elem.getAttribute('id') === 'toYear')
    expect(toYearSelect.getAttribute('value')).toBe('2019')

    // Select another start month
    fireEvent.click(getByText('January'))
    fireEvent.click(getByText('February'))
    // The income and one of the categories should not be showing up anymore
    fromMonthSelect = getByText((content, elem) => elem.getAttribute('id') === 'fromMonth')
    expect(fromMonthSelect.getAttribute('value')).toBe('February')
    nodes = getAllByText((content, node) => node.getAttribute('data-type') === 'node')
    links = getAllByText((content, node) => node.getAttribute('data-type') === 'link')
    expect(nodes.length).toBe(group.options.length + 1)
    expect(links.length).toBe(group.options.length)

    // Select another end month so that start Date is after end Date
    await waitForElement(() => getByText(toMonth))
    fireEvent.click(getByText(toMonth))
    fireEvent.click(getByText('January'))
    // end date should not have changed
    toMonthSelect = getByText((content, elem) => elem.getAttribute('id') === 'toMonth')
    expect(toMonthSelect.getAttribute('value')).toBe(toMonth)
    // await waitForElement(() => getByText('The start date needs to come before the end date'))
    expect(store.getActions()).toEqual([{
      payload: {
        text: 'The start date needs to come before the end date',
        status: 'error'
      },
      type: 'SHOW_SNACKBAR'
    }])

    // Select the same  start and end date
    await waitForElement(() => getByText(toMonth))
    fireEvent.click(getByText(toMonth))
    fireEvent.click(getAllByText('February')[1])
    toMonthSelect = getByText((content, elem) => elem.getAttribute('id') === 'toMonth')
    expect(toMonthSelect.getAttribute('value')).toBe('February')
    nodes = getAllByText((content, node) => node.getAttribute('data-type') === 'node')
    links = getAllByText((content, node) => node.getAttribute('data-type') === 'link')
    expect(nodes.length).toBe(3) // Income -> group -> category
    expect(links.length).toBe(2)
  })
})
