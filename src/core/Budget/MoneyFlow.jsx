import React, { useState, useMemo, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector } from 'react-redux'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import { startOfMonth, endOfMonth } from 'date-fns'
import SankeyDiagram from './SankeyDiagram'

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
  const [recWidth, setRecWidth] = useState(0)
  const [recHeight, setRecHeight] = useState(0)
  const { budget, transactions, dateFormatter } = useSelector((state) => ({
    transactions: state.transactions.list.sort((a, b) => a.createdAt - b.createdAt),
    budget: state.budget,
    dateFormatter: (new Intl.DateTimeFormat(state.settings.locale, { month: 'long' })).format
  }))
  const userHasBudget = Object.keys(budget.rules).length > 0
  const start = new Date(transactions[0].createdAt)
  const end = new Date(transactions[transactions.length - 1].createdAt)
  const yearsList = Array.from(
    Array(end.getFullYear() - start.getFullYear() + 1).keys(),
    (n) => start.getFullYear() + n
  )
  const monthsList = Array.from(Array(12).keys(), (n) => n + 1).map(
    (month) => dateFormatter(new Date(`${month}/01/1970`).getTime())
  )
  const initialValues = {
    fromYear: yearsList[0],
    fromMonth: monthsList[start.getMonth()],
    toYear: yearsList[yearsList.length - 1],
    toMonth: monthsList[end.getMonth()]
  }
  initialValues.fromDate = startOfMonth(new Date(`${initialValues.fromMonth}/01/${initialValues.fromYear}`))
  initialValues.toDate = endOfMonth(new Date(`${initialValues.toMonth}/01/${initialValues.toYear}`))

  const [values, setValues] = useState(initialValues)

  const graphData = useMemo(() => {
    const incomeGroupId = budget.categoryTree.find((group) => group.isIncome).id
    const usedCategories = Object.values(transactions
      .filter((transaction) => {
        return transaction.categoryId !== undefined
          && transaction.createdAt >= values.fromDate.getTime()
          && transaction.createdAt <= values.toDate.getTime()
      })
      .reduce((result, transaction) => {
        const category = budget.categoriesById[transaction.categoryId]
        const group = budget.categoriesById[category.parentId]
        const index = Object.keys(result).length
        return {
          ...result,
          [category.id]: {
            ...category,
            index: (result[category.id] === undefined ? index : result[category.id].index),
            total: result[category.id] === undefined
              ? transaction.amount
              : result[category.id].total + transaction.amount
          },
          [group.id]: {
            ...group,
            index: (result[group.id] === undefined ? index + 1 : result[group.id].index),
            total: result[group.id] === undefined
              ? transaction.amount
              : result[group.id].total + transaction.amount
          }
        }
      }, {}))

    const incomeCategories = usedCategories.filter(
      (category) => category.parentId === incomeGroupId
    )
    const incomeGroup = usedCategories.find(
      (category) => category.id === incomeGroupId
    )

    return usedCategories
      .sort((a, b) => a.index > b.index)
      .reduce((data, category) => {
        const newLinks = []
        if (category.id === incomeGroupId) { // Income group
          // from income categories
          incomeCategories.forEach((incomeCategory) => {
            newLinks.push({
              source: incomeCategory.index,
              target: category.index,
              value: Math.abs(incomeCategory.total)
            })
          })
        } else if (category.parentId === undefined) { // Non income groups
          // from income group
          newLinks.push({
            source: incomeGroup.index,
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
            { name: category.name, data: category, isIncome: category.parentId === incomeGroupId }
          ],
          links: [
            ...data.links,
            ...newLinks
          ]
        }
      }, { nodes: [], links: [] })
  }, [budget, transactions, values])

  const svgRef = useCallback((node) => {
    const measureSVG = () => {
      const { width, height } = node.getBoundingClientRect()
      setRecWidth(width)
      setRecHeight(height)
    }

    if (node !== null) {
      measureSVG()
      window.addEventListener('resize', measureSVG)
    } else {
      window.removeEventListener('resize', measureSVG)
    }
  }, [])

  function handleChange(event) {
    setValues((oldValues) => {
      const newValues = {
        ...oldValues,
        [event.target.name]: event.target.value
      }
      newValues.fromDate = startOfMonth(new Date(`${newValues.fromMonth}/01/${newValues.fromYear}`))
      newValues.toDate = endOfMonth(new Date(`${newValues.toMonth}/01/${newValues.toYear}`))
      return newValues
    })
  }
  console.log(values)
  return (
    <Container className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12} className={classes.pageHeader}>
          <Typography variant="h5" className={classes.chartTitle}>
            Money flow
          </Typography>
          <div className={classes.filters}>
            <Typography className={classes.filterLabel}>
              From
            </Typography>
            <FormControl className={classes.filterMonthSelect}>
              <InputLabel shrink htmlFor="fromMonth-label-placeholder">Month</InputLabel>
              <Select
                value={values.fromMonth}
                onChange={handleChange}
                inputProps={{ name: 'fromMonth', id: 'fromMonth' }}
              >
                {monthsList.map((month) => (
                  <MenuItem key={month} value={month}>{month}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel shrink htmlFor="fromYear-label-placeholder">Year</InputLabel>
              <Select
                value={values.fromYear}
                onChange={handleChange}
                inputProps={{ name: 'fromYear', id: 'fromYear' }}
              >
                {yearsList.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography className={classes.filterLabel}>
              To
            </Typography>
            <FormControl className={classes.filterMonthSelect}>
              <InputLabel shrink htmlFor="toMonth-label-placeholder">Month</InputLabel>
              <Select
                value={values.toMonth}
                onChange={handleChange}
                inputProps={{ name: 'toMonth', id: 'toMonth' }}
              >
                {monthsList.map((month) => (
                  <MenuItem key={month} value={month}>{month}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel shrink htmlFor="toYear-label-placeholder">Year</InputLabel>
              <Select
                value={values.toYear}
                onChange={handleChange}
                inputProps={{ name: 'toYear', id: 'toYear' }}
              >
                {yearsList.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.budgetChart}>
            {!userHasBudget && (
              <Typography>
                Not enough data to generate chart
              </Typography>
            )}
            {userHasBudget && (
              <svg width="100%" height="100%" ref={svgRef}>
                {graphData && (
                  <SankeyDiagram data={graphData} width={recWidth} height={recHeight} />
                )}
              </svg>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default MoneyFlow
