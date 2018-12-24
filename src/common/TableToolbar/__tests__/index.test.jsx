import React from 'react'
import renderer from 'react-test-renderer'
import TableToolbar from '../'

describe('TableToolbar', () => {
  const mochOnDelete = jest.fn()

  it('matches snapshot with some transactions', () => {
    const component = renderer.create((
      <TableToolbar
        title="Transactions"
        selectedItems={['a']}
        onDelete={mochOnDelete}
      >
        <div>Content 1</div>
        <div>Content 2</div>
      </TableToolbar>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })


  it('matches snapshot with no transactions', () => {
    const component = renderer.create((
      <TableToolbar
        title="Transactions"
        selectedItems={[]}
        onDelete={mochOnDelete}
      >
        <div>Content 1</div>
        <div>Content 2</div>
      </TableToolbar>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
