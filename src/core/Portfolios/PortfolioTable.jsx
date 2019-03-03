import React from 'react'
import _ from 'lodash'
import { compose } from 'recompose'
import { connect } from 'react-redux'
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
import {
  portfolioTableDataSelector,
  portfolioTotalsSelector
} from '../../store/transactions/selectors'

const styles = {
  tooltip: {
    maxWidth: 200
  }
}

const mapStateToProps = (state) => {
  return {
    portfolioTableData: portfolioTableDataSelector(state),
    totals: portfolioTotalsSelector(state)
  }
}

const PortfolioTable = ({ classes, portfolioTableData, totals }) => {
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
        {_.map(portfolioTableData, (position) => {
          return (
            <TableRow key={position.ticker}>
              <TableCell>{position.ticker}</TableCell>
              <TableCell numeric>
                {position.percentage}
                %
              </TableCell>
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
          <TableCell numeric>{currencyFormatter.format(totals.bookValue)}</TableCell>
          <TableCell numeric>{currencyFormatter.format(totals.marketValue)}</TableCell>
          <TableCell numeric>{currencyFormatter.format(totals.pl)}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}

PortfolioTable.propTypes = {
  classes: PropTypes.object.isRequired,
  portfolioTableData: PropTypes.array.isRequired,
  totals: PropTypes.object.isRequired
}

export default compose(
  connect(mapStateToProps),
  withStyles(styles)
)(PortfolioTable)
