import React from 'react'
import renderer from 'react-test-renderer'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import AddIcon from '@material-ui/icons/Add'
import TableToolbar from '../'

describe('TableToolbar', () => {
  const mochOnDelete = jest.fn()
  const mochHandleNew = jest.fn()

  it('matches snapshot with some transactions', () => {
    const component = renderer.create((
      <TableToolbar
        title="Transactions"
        selectedItems={['a']}
        onDelete={mochOnDelete}
      >
        <Tooltip title="New transaction">
          <IconButton aria-label="New transaction" onClick={mochHandleNew}>
            <AddIcon />
          </IconButton>
        </Tooltip>
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
        <Tooltip title="New transaction">
          <IconButton aria-label="New transaction" onClick={mochHandleNew}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </TableToolbar>
    ))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
