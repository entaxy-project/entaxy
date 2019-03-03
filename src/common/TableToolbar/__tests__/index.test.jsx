import React from 'react'
import renderer from 'react-test-renderer'
import TableToolbar from '..'

describe('TableToolbar', () => {
  it('matches snapshot with some selected items', () => {
    const component = renderer.create((
      <TableToolbar
        title="Transactions"
        selectedItems={['a']}
      >
        <div>Content 1</div>
        <div>Content 2</div>
      </TableToolbar>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })


  it('matches snapshot with no selected items', () => {
    const component = renderer.create((
      <TableToolbar
        title="Transactions"
        subtitle="Some error was found"
        selectedItems={[]}
      />
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
