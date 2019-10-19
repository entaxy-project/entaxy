import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector } from 'react-redux'
import { withRouter } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Button from '@material-ui/core/Button'
import grey from '@material-ui/core/colors/grey'
import * as d3 from 'd3'
import AccountsChart from './AccountsChart'
import InstitutionIcon from '../../common/InstitutionIcon'
import LinkTo from '../../common/LinkTo'
import { currencyFormatter } from '../../util/stringFormatter'
import { assetAccounts, liabilityAccounts } from '../../store/accounts/reducer'

const useStyles = makeStyles((theme) => ({
  accountsTable: {
    padding: theme.spacing(2)
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  institutionRow: {
    background: '#fafafa'
  },
  institutionWrapper: {
    display: 'flex'
  },
  institutionIcon: {
    marginRight: 16,
    color: grey[600]
  },
  accountRow: {
    cursor: 'pointer'
  },
  accountWrapper: {
    paddingLeft: theme.spacing(4),
    overflowX: 'auto',
    maxWidth: 0,
    textOverflow: 'ellipsis'
  },
  accountsChart: {
    padding: theme.spacing(2),
    height: 240,
    minWidth: 150
  },
  emptyChart: {
    padding: 40
  },
  noAccountsPaper: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    textAlign: 'center'
  },
  newAccountButton: {
    marginTop: theme.spacing(1),
    textAlign: 'right'
  }
}))

const AccountsTable = ({ history, filter }) => {
  const classes = useStyles()
  const { accounts, settings, formatCurrency } = useSelector((state) => ({
    accounts: state.accounts,
    settings: state.settings,
    formatCurrency: (value) => currencyFormatter(settings.locale, settings.currency)(value)
  }))

  const handleClick = (account) => {
    history.push(`/accounts/${account.id}/transactions`)
  }

  const accountTypes = Object.keys(filter === 'Liabilities' ? liabilityAccounts : assetAccounts)

  const data = { table: [], chart: [] }
  let count = 0
  let total = 0
  const colorScale = d3.scaleOrdinal(d3.schemePaired)
  Object.keys(accounts.byInstitution).sort().forEach((institution) => {
    Object.values(accounts.byInstitution[institution].groups).forEach((group) => {
      group.accountIds.forEach((accountId) => {
        const account = accounts.byId[accountId]
        if (account) {
          const {
            id,
            name,
            accountType,
            currentBalance: { localCurrency: balance }
          } = account
          const accountMatchesType = (balance === 0 && accountTypes.includes(accountType))
          if (
            (filter === 'Assets' && (balance > 0 || accountMatchesType))
            || (filter === 'Liabilities' && (balance < 0 || accountMatchesType))
          ) {
            data.chart.push({
              name,
              value: Math.abs(balance || 0),
              colour: colorScale(count)
            })
            if (!(institution in data.table)) {
              data.table[institution] = { total: 0, accountIds: [] }
            }
            data.table[institution].accountIds.push(id)
            data.table[institution].total += balance
            total += balance
            count += 1
          }
        }
      })
    })
  })

  const renderChart = data.chart.length > 0 && total !== 0
  return (
    <Paper className={classes.accountsTable}>
      <Grid container className={classes.header}>
        <Typography variant="subtitle2">{filter}</Typography>
        <Typography variant="subtitle1">{formatCurrency(total)}</Typography>
      </Grid>
      {renderChart && (
        <AccountsChart data={data.chart} filter={filter} />
      )}
      {!renderChart && (
        <Typography variant="caption" align="center" paragraph className={classes.emptyChart}>
          Not enough data to display chart
        </Typography>
      )}
      {Object.keys(data.table).length > 0 && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Institution / Account</TableCell>
              <TableCell align="right">{`Total ${settings.currency}`}</TableCell>
            </TableRow>
          </TableHead>
          {Object.keys(data.table).sort().map((institution) => (
            <TableBody key={institution}>
              <TableRow className={classes.institutionRow}>
                <TableCell className={classes.institutionWrapper}>
                  <InstitutionIcon
                    institution={institution}
                    size="small"
                    className={classes.institutionIcon}
                  />
                  <Typography variant="subtitle2">
                    {institution}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2">
                    {formatCurrency(data.table[institution].total)}
                  </Typography>
                </TableCell>
              </TableRow>
              {data.table[institution].accountIds.map((id) => {
                const account = accounts.byId[id]
                if (account === undefined) return null
                return (
                  <TableRow key={id} hover onClick={() => handleClick(account)} className={classes.accountRow}>
                    <TableCell className={classes.accountWrapper} title={account.name}>
                      {account.name}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(account.currentBalance.localCurrency)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          ))}
        </Table>
      )}
      <div className={classes.newAccountButton}>
        <Button
          color="secondary"
          component={LinkTo('/accounts/new')}
        >
          New account
        </Button>
      </div>
    </Paper>
  )
}

AccountsTable.propTypes = {
  history: PropTypes.object.isRequired,
  filter: PropTypes.string.isRequired
}

export default withRouter(AccountsTable)
