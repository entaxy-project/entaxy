import React from 'react'
import _ from 'lodash'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableFooter from '@material-ui/core/TableFooter'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

import { getBookValue, getMarketValue, getPL } from './lib/util'

const PortfolioTable = (classes, portfolioTable) => {
  const currencyFormatter = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' })

  return (
    <Table className={classes.table}>
      <TableHead>
        <TableRow>
          <TableCell>Ticker</TableCell>
          <TableCell numeric>Percentage</TableCell>
          <TableCell numeric>Shares</TableCell>
          <TableCell numeric>Market Value</TableCell>
          <TableCell numeric>Book Value</TableCell>
          <TableCell numeric>P/L</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {_.map(portfolioTable, (position) => {
          return (
            <TableRow key={position.symbol}>
              <TableCell>{position.symbol}</TableCell>
              <TableCell numeric>{position.percentage}</TableCell>
              <TableCell numeric>{position.quantity}</TableCell>
              <TableCell numeric>{currencyFormatter.format(position.marketValue)}</TableCell>
              <TableCell numeric>{currencyFormatter.format(position.bookValue)}</TableCell>
              <TableCell numeric>{currencyFormatter.format(position.pl)}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell />
          <TableCell />
          <TableCell />
          <TableCell numeric>{currencyFormatter.format(getMarketValue(portfolioTable))}</TableCell>
          <TableCell numeric>{currencyFormatter.format(getBookValue(portfolioTable))}</TableCell>
          <TableCell numeric>{currencyFormatter.format(getPL(portfolioTable))}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>)
}

export default PortfolioTable
