import React, { useReducer } from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import 'react-date-range/dist/styles.css' // main style file
import 'react-date-range/dist/theme/default.css' // theme css file
import { format, startOfMonth, subMonths } from 'date-fns'
import BudgetLineChart from './BudgetLineChart'
import PopupDateRangePicker from '../../common/PopupDateRangePicker'
import { liabilityAccounts } from '../../store/accounts/reducer'

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2)
  },
  budgetChart: {
    padding: theme.spacing(2),
    height: 400,
    minWidth: 200
  },
  pageHeader: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between'
  },
  filters: {
    display: 'flex',
    justifyContent: 'flex-end'
  }
}))

const HistoryChart = () => {
  const classes = useStyles()
  const {
    accounts,
    transactions,
    budgetCategoriesById
  } = useSelector((state) => ({
    accounts: state.accounts.byId,
    transactions: state.transactions.list.filter((transaction) => (
      transaction.categoryId !== undefined
      && !state.budget.categoriesById[transaction.categoryId].isIncome
    )).sort((a, b) => a.createdAt - b.createdAt),
    budgetCategoriesById: state.budget.categoriesById
  }))


  const filterTransactions = ({ startDate, endDate }) => {
    const usedCategories = {}
    const filteredTransactions = transactions.filter((transaction) => {
      const category = budgetCategoriesById[transaction.categoryId]
      const group = budgetCategoriesById[category.parentId]
      if (
        !group.isIncome
        && transaction.createdAt >= startDate.getTime()
        && transaction.createdAt <= endDate.getTime()
      ) {
        usedCategories[category.name] = { ...category, selected: true }
        return true
      }
      return false
    })
    return { filteredTransactions, usedCategories }
  }

  const aggregateData = (filteredTransactions, usedCategories) => {
    const byPeriod = {}
    filteredTransactions.forEach((transaction) => {
      const date = startOfMonth(transaction.createdAt).getTime()
      const category = budgetCategoriesById[transaction.categoryId]
      const { accountType } = accounts[transaction.accountId]
      if (usedCategories[category.name].selected) {
        if (byPeriod[date] === undefined) {
          // initialize entries for this date
          byPeriod[date] = Object.values(usedCategories).sort().reduce(
            (res, cat) => {
              if (cat.selected) return { ...res, [cat.name]: 0 }
              return res
            }, {}
          )
        }
        if (byPeriod[date][category.name] === undefined) {
          byPeriod[date][category.name] = 0
        }
        if (accountType in Object.keys(liabilityAccounts)) {
          byPeriod[date][category.name] += transaction.amount.localCurrency
        } else {
          byPeriod[date][category.name] -= transaction.amount.localCurrency
        }
      }
    })

    return Object.keys(byPeriod).sort((a, b) => a - b).map((date) => ({
      date: format(parseInt(date, 10), 'MMM yyyy'),
      ...byPeriod[date]
    }))
  }

  const init = (prevState = {}, newDateRange = null) => {
    let dateRange
    if (!newDateRange) {
      const minDate = transactions.length > 0 ? new Date(transactions[0].createdAt) : new Date()
      const maxDate = transactions.length > 0 ? new Date(transactions[transactions.length - 1].createdAt) : new Date()
      dateRange = {
        minDate,
        maxDate,
        startDate: subMonths(startOfMonth(maxDate), 3),
        endDate: maxDate,
        key: 'selection'
      }
    } else {
      dateRange = {
        ...prevState.dateRange,
        startDate: newDateRange.startDate,
        endDate: newDateRange.endDate
      }
    }

    const { filteredTransactions, usedCategories } = filterTransactions(dateRange)
    return {
      dateRange,
      filteredTransactions,
      usedCategories,
      data: aggregateData(filteredTransactions, usedCategories)
    }
  }

  const reducer = (state, { type, payload }) => {
    switch (type) {
      case 'UPDATE_DATE_RANGE': {
        return init(state, payload)
      }
      case 'TOGGLE_CATEGORY': {
        const usedCategories = {
          ...state.usedCategories,
          [payload]: {
            ...state.usedCategories[payload],
            selected: !state.usedCategories[payload].selected
          }
        }
        return {
          ...state,
          usedCategories,
          data: aggregateData(state.filteredTransactions, usedCategories)
        }
      }
      default:
        throw new Error()
    }
  }

  const [state, dispatch] = useReducer(reducer, init())

  const handleLegendClick = (dataKey) => {
    dispatch({ type: 'TOGGLE_CATEGORY', payload: dataKey })
  }

  const handleSelectDate = (ranges) => {
    dispatch({ type: 'UPDATE_DATE_RANGE', payload: ranges.selection })
  }

  return (
    <Container className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12} className={classes.pageHeader}>
          <Typography variant="h4">Budget history</Typography>
          <div className={classes.filters}>
            <PopupDateRangePicker
              ranges={[state.dateRange]}
              onChange={handleSelectDate}
              minDate={state.dateRange.minDate}
              maxDate={state.dateRange.maxDate}
            >
              {format(state.dateRange.startDate, 'MMM dd, yyyy')} -&nbsp;
              {format(state.dateRange.endDate, 'MMM dd, yyyy')}
            </PopupDateRangePicker>
          </div>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.budgetChart}>
            <BudgetLineChart
              data={state.data}
              categories={state.usedCategories}
              onLegendClick={handleLegendClick}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default HistoryChart
