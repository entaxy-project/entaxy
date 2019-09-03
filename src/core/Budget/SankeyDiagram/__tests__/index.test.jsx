import React from 'react'
import {
  render,
  cleanup,
  fireEvent
} from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { Provider } from 'react-redux'
import SankeyDiagram from '..'
import store from '../../../../store'

afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})

const data = {
  nodes: [
    { name: 'Income', data: { id: 'n1', name: 'Income', total: 20 } },
    { name: 'Subscriptions', data: { id: 'n2', name: 'Subscriptions', total: 10 } },
    { name: 'Netflix', data: { parentId: 'n2', name: 'Netflix', total: 5 } }
  ],
  links: [
    { source: 0, target: 1, value: 1 },
    { source: 1, target: 2, value: 1 }
  ]
}

describe('SankeyDiagram', () => {
  it('renders correctly', async () => {
    const props = {
      data,
      width: 100,
      height: 100
    }
    const { getByText } = render(
      <Provider store={store}>
        <SankeyDiagram {...props} />
      </Provider>
    )

    expect(getByText('Income', { selector: 'title' })).toBeInTheDocument()
    expect(getByText('Subscriptions', { selector: 'title' })).toBeInTheDocument()
    expect(getByText('Netflix', { selector: 'title' })).toBeInTheDocument()
  })

  it('shows tooltip when overing a node', async () => {
    const props = {
      data,
      width: 100,
      height: 100
    }
    const { getByTestId, queryByTestId } = render(
      <Provider store={store}>
        <SankeyDiagram {...props} />
      </Provider>
    )

    expect(getByTestId('n1').getAttribute('stroke')).not.toBe('black')
    expect(getByTestId('n1').getAttribute('data-type')).toBe('node')
    expect(queryByTestId('tooltipTitle')).not.toBeInTheDocument()
    expect(queryByTestId('tooltipTotal')).not.toBeInTheDocument()
    fireEvent.mouseOver(getByTestId('n1'))
    expect(getByTestId('n1').getAttribute('stroke')).toBe('black')
    expect(getByTestId('tooltipTitle').innerHTML).toBe('Income')
    expect(getByTestId('tooltipTotal').innerHTML).toBe('$20.00')
    fireEvent.mouseOut(getByTestId('n1'))
    expect(getByTestId('n1').getAttribute('stroke')).not.toBe('black')
    expect(queryByTestId('tooltipTitle')).not.toBeInTheDocument()
    expect(queryByTestId('tooltipTotal')).not.toBeInTheDocument()
    expect(getByTestId('n2').getAttribute('stroke')).not.toBe('black')
    fireEvent.mouseOver(getByTestId('n2'))
    expect(getByTestId('n2').getAttribute('stroke')).toBe('black')
    expect(getByTestId('tooltipTitle').innerHTML).toBe('Subscriptions')
    expect(getByTestId('tooltipTotal').innerHTML).toBe('$10.00')
  })

  it('overing a link highlights it', async () => {
    const props = {
      data,
      width: 100,
      height: 100
    }
    const { getByTestId } = render(
      <Provider store={store}>
        <SankeyDiagram {...props} />
      </Provider>
    )

    expect(getByTestId('0').getAttribute('data-type')).toBe('link')
    expect(getByTestId('0')).not.toHaveStyle('stroke: black')
    fireEvent.mouseOver(getByTestId('0'))
    expect(getByTestId('0')).toHaveStyle('stroke: black')
    fireEvent.mouseOut(getByTestId('0'))
    expect(getByTestId('0')).not.toHaveStyle('stroke: black')
  })
})
