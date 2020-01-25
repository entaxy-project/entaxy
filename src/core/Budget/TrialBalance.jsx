/* eslint-disable no-plusplus */
import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector } from 'react-redux'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import { format } from 'date-fns'
import { currencyFormatter } from '../../util/stringFormatter'
import PopupDateRangePicker from '../../common/PopupDateRangePicker'
import useDateRange from '../../util/useDateRange'
import { assetAccounts } from '../../store/accounts/reducer'

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(4)
  },
  budgetChart: {
    padding: theme.spacing(2),
    height: 400,
    minWidth: 200
  },
  pageHeader: {
    padding: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-between'
  },
  filters: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  filterLabel: {
    paddingTop: 20,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    color: theme.palette.grey[700]
  },
  filterMonthSelect: {
    minWidth: 100,
    marginRight: theme.spacing(1)
  },
  tableHeader: {
    backgroundColor: theme.palette.grey[200]
  },
  accountGroup: {
    paddingTop: theme.spacing(1) / 2,
    paddingBottom: theme.spacing(1) / 2,
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: theme.palette.grey[100]
  },
  indentedCell: {
    paddingLeft: theme.spacing(4)
  },
  total: {
    backgroundColor: theme.palette.grey[200],
    fontWeight: 'bold'
  }
}))

const TrialBalance = () => {
  const classes = useStyles()
  const {
    accounts,
    transactions,
    budget,
    formatCurrency
  } = useSelector((state) => ({
    accounts: state.accounts.byId,
    transactions: state.transactions.list.sort((a, b) => a.createdAt - b.createdAt),
    budget: state.budget,
    formatCurrency: (value) => currencyFormatter(state.settings.locale, state.settings.currency)(value)
  }))

  const [dateRange, handleSelectDate] = useDateRange(transactions)
  const { startDate, endDate } = dateRange
  const startTimestamp = startDate.getTime()
  const endTimestamp = endDate.getTime()

  const labelFor = (amount) => (
    amount > 0 ? { debit: Math.abs(amount), credit: 0 } : { debit: 0, credit: Math.abs(amount) }
  )

  const balances = {}
  // Initialize account balances
  Object.values(accounts).forEach((account) => {
    const {
      id,
      accountType,
      openingBalance,
      openingBalanceDate
    } = account
    if (openingBalanceDate <= endTimestamp) {
      balances[id] = {
        accountType,
        balance: openingBalance,
        name: [account.institution, account.name].join(' - ')
      }
    }
  })

  // Add transactions to account balances
  for (let t = 0; t < transactions.length; t++) {
    const {
      createdAt,
      accountId,
      amount: { localCurrency: amount },
      categoryId
    } = transactions[t]
    const { openingBalanceDate } = accounts[accountId]
    if (createdAt >= openingBalanceDate && accountId in balances && createdAt <= endTimestamp) {
      // Add to the balance of the account
      balances[accountId].balance += amount
      if (categoryId && createdAt >= startTimestamp) {
        if (!(categoryId in balances)) {
          balances[categoryId] = {
            balance: 0,
            name: budget.categoriesById[categoryId].name
          }
        }
        balances[categoryId].balance += amount
      }
    }
  }

  const assetAccountTypes = Object.keys(assetAccounts)
  const data = {
    Assets: {},
    Liabilities: {},
    Equity: {},
    Revenue: {},
    Expenses: {}
  }
  let equity = 0
  Object.keys(balances).forEach((id) => {
    let accountGroup
    if ('accountType' in balances[id]) {
      accountGroup = assetAccountTypes.includes(balances[id].accountType) ? 'Assets' : 'Liabilities'
    } else {
      accountGroup = balances[id].balance > 0 ? 'Revenue' : 'Expenses'
    }
    data[accountGroup][balances[id].name] = labelFor(balances[id].balance)
    equity -= balances[id].balance
  })
  data.Equity = { Networth: labelFor(equity) }

  const total = { debit: 0, credit: 0 }
  return (
    <Container className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12} className={classes.pageHeader}>
          <Typography variant="h4">Trial Balance</Typography>
          <div className={classes.filters}>
            <PopupDateRangePicker
              ranges={[dateRange]}
              onChange={handleSelectDate}
              minDate={dateRange.minDate}
              maxDate={dateRange.maxDate}
            >
              {format(dateRange.startDate, 'MMM dd, yyyy')} -&nbsp;
              {format(dateRange.endDate, 'MMM dd, yyyy')}
            </PopupDateRangePicker>
          </div>
        </Grid>
        <Grid item xs={12}>
          <Table size="small">
            <TableHead>
              <TableRow className={classes.tableHeader}>
                <TableCell>Account</TableCell>
                <TableCell align="right">Debit</TableCell>
                <TableCell align="right">Credit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(data).map((accountGroup) => {
                return (
                  <React.Fragment key={accountGroup}>
                    <TableRow>
                      <TableCell colSpan={3} className={classes.accountGroup}>{accountGroup}</TableCell>
                    </TableRow>
                    {Object.keys(data[accountGroup]).map((entry) => {
                      total.debit += data[accountGroup][entry].debit
                      total.credit += data[accountGroup][entry].credit
                      return (
                        <TableRow key={entry}>
                          <TableCell className={classes.indentedCell}>{entry}</TableCell>
                          <TableCell align="right">{formatCurrency(data[accountGroup][entry].debit)}</TableCell>
                          <TableCell align="right">{formatCurrency(data[accountGroup][entry].credit)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </React.Fragment>
                )
              })}
            </TableBody>
            <TableHead>
              <TableRow className={classes.total}>
                <TableCell>Total</TableCell>
                <TableCell align="right">{formatCurrency(total.debit)}</TableCell>
                <TableCell align="right">{formatCurrency(total.credit)}</TableCell>
              </TableRow>
            </TableHead>
          </Table>
        </Grid>
      </Grid>
    </Container>
  )
}

export default TrialBalance
