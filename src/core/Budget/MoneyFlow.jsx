import React, { useState, useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector } from 'react-redux'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { format, startOfMonth, subMonths } from 'date-fns'
import SankeyDiagram from './SankeyDiagram'
import PopupDateRangePicker from '../../common/PopupDateRangePicker'

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
    padding: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-between'
  },
  chartTitle: {
    marginTop: theme.spacing(2)
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
  }
}))

const MoneyFlow = () => {
  const classes = useStyles()
  const {
    budgetCategoriesById,
    incomeGroupId,
    transactions
  } = useSelector((state) => ({
    transactions: state.transactions.list.filter((transaction) => (
      transaction.categoryId !== undefined
    )).sort((a, b) => a.createdAt - b.createdAt),
    budgetCategoriesById: state.budget.categoriesById,
    incomeGroupId: state.budget.categoryTree.find((group) => group.isIncome).id
  }))

  const [dateRange, setDateRange] = useState(() => {
    const minDate = transactions.length > 0 ? new Date(transactions[0].createdAt) : new Date()
    const maxDate = transactions.length > 0 ? new Date(transactions[transactions.length - 1].createdAt) : new Date()
    return {
      minDate,
      maxDate,
      startDate: subMonths(startOfMonth(maxDate), 3),
      endDate: maxDate,
      key: 'selection'
    }
  })

  const graphData = useMemo(() => {
    const { startDate, endDate } = dateRange
    const expenseGroup = {
      id: 'Expenses',
      name: 'Expenses',
      index: 1,
      total: 0
    }

    const filteredTransactions = transactions.filter((transaction) => (
      transaction.createdAt >= startDate.getTime() && transaction.createdAt <= endDate.getTime()
    ))

    const usedCategories = Object.values(filteredTransactions.reduce((result, transaction) => {
      const category = budgetCategoriesById[transaction.categoryId]
      const group = budgetCategoriesById[category.parentId]
      const index = Object.keys(result).length
      return {
        ...result,
        [category.id]: {
          ...category,
          index: (result[category.id] === undefined ? index : result[category.id].index),
          total: result[category.id] === undefined
            ? transaction.amount.localCurrency
            : result[category.id].total + transaction.amount.localCurrency
        },
        [group.id]: {
          ...group,
          index: (result[group.id] === undefined ? index + 1 : result[group.id].index),
          total: result[group.id] === undefined
            ? transaction.amount.localCurrency
            : result[group.id].total + transaction.amount.localCurrency
        }
      }
    }, {
      [incomeGroupId]: {
        ...budgetCategoriesById[incomeGroupId],
        index: 0,
        total: 0
      },
      Expense: expenseGroup
    }))
    const incomeCategories = usedCategories.filter((cat) => cat.parentId === incomeGroupId)
    const incomeGroup = usedCategories.find((cat) => cat.id === incomeGroupId)

    if (filteredTransactions.length === 0) {
      return { nodes: [], links: [] }
    }

    return usedCategories
      .sort((a, b) => a.index > b.index)
      .reduce((data, category) => {
        const newLinks = []
        if (category.id === incomeGroupId) { // Income group
          // from income categories to income group
          incomeCategories.forEach((incomeCategory) => {
            expenseGroup.total += Math.abs(incomeCategory.total)
            newLinks.push({
              source: incomeCategory.index,
              target: category.index,
              value: Math.abs(incomeCategory.total)
            })
          })
          // from income group to expenses group
          newLinks.push({
            source: incomeGroup.index,
            target: 1,
            value: expenseGroup.total
          })
        } else if (category.parentId === undefined && category.id !== 'Expenses') { // Non income groups
          // from expenses group to non income groups
          newLinks.push({
            source: expenseGroup.index,
            target: category.index,
            value: Math.abs(category.total)
          })
          // to child categories
          usedCategories
            .filter((cat) => cat.parentId === category.id)
            .forEach((childCategory) => {
              newLinks.push({
                source: category.index,
                target: childCategory.index,
                value: Math.abs(childCategory.total)
              })
            })
        }
        return {
          ...data,
          nodes: [
            ...data.nodes,
            {
              name: category.name,
              data: category,
              isIncome: category.parentId === incomeGroupId
            }
          ],
          links: [...data.links, ...newLinks]
        }
      }, { nodes: [], links: [] })
  }, [budgetCategoriesById, incomeGroupId, transactions, dateRange])

  const handleSelectDate = (ranges) => {
    setDateRange((prevState) => ({
      ...prevState,
      startDate: ranges.selection.startDate,
      endDate: ranges.selection.endDate
    }))
  }

  return (
    <Container className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12} className={classes.pageHeader}>
          <Typography variant="h5" className={classes.chartTitle}>
            Money flow
          </Typography>
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
          <Paper className={classes.budgetChart}>
            {(graphData.links.length === 0) && (
              <Typography>
                Not enough data to generate chart
              </Typography>
            )}
            {graphData.links.length > 0 && (
              <SankeyDiagram data={graphData} />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default MoneyFlow
