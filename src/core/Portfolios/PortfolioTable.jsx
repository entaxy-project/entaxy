import React from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableFooter from '@material-ui/core/TableFooter'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Tooltip from '@material-ui/core/Tooltip'
import InfoIcon from '@material-ui/icons/Info'
import { getBookValue, getMarketValue, getPL } from './lib/util'

const styles = {
  tooltip: {
    maxWidth: 200
  }
}

const PortfolioTable = ({ classes, portfolioTable }) => {
  const currencyFormatter = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' })

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Ticker</TableCell>
          <TableCell numeric>Percentage</TableCell>
          <TableCell numeric>Shares</TableCell>
          <TableCell numeric>
            <Tooltip
              placement="top"
              classes={{ tooltip: classes.tooltip }}
              title="The book value of an asset is its original purchase cost"
            >
              <InfoIcon style={{ fontSize: 14 }} />
            </Tooltip>
            &nbsp;Book Value
          </TableCell>
          <TableCell numeric>
            <Tooltip
              placement="top"
              classes={{ tooltip: classes.tooltip }}
              title="Market value is the price that could be obtained by selling an asset on a competitive, open market"
            >
              <InfoIcon style={{ fontSize: 14 }} />
            </Tooltip>
            &nbsp;Market Value
          </TableCell>
          <TableCell numeric>P/L</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {_.map(portfolioTable, (position) => {
          return (
            <TableRow key={position.ticker}>
              <TableCell>{position.ticker}</TableCell>
              <TableCell numeric>{position.percentage}%</TableCell>
              <TableCell numeric>{position.shares}</TableCell>
              <TableCell numeric>{currencyFormatter.format(position.bookValue)}</TableCell>
              <TableCell numeric>{currencyFormatter.format(position.marketValue)}</TableCell>
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
          <TableCell numeric>{currencyFormatter.format(getBookValue(portfolioTable))}</TableCell>
          <TableCell numeric>{currencyFormatter.format(getMarketValue(portfolioTable))}</TableCell>
          <TableCell numeric>{currencyFormatter.format(getPL(portfolioTable))}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>)
}

PortfolioTable.propTypes = {
  classes: PropTypes.object.isRequired,
  portfolioTable: PropTypes.array.isRequired
}

export default withStyles(styles)(PortfolioTable)
