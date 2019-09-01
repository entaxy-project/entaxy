import React, { useState, useMemo, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector } from 'react-redux'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
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
  chartTitle: {
    padding: theme.spacing(1)
  }
}))

const MoneyFlow = () => {
  const classes = useStyles()
  const [recWidth, setRecWidth] = useState(0)
  const [recHeight, setRecHeight] = useState(0)
  const { budget, transactions } = useSelector((state) => ({
    transactions: state.transactions.list,
    budget: state.budget
  }))
  const userHasBudget = Object.keys(budget.rules).length > 0

  const graphData = useMemo(() => {
    console.log('generateSankeyGraphData')
    const incomeGroupId = budget.categoryTree.find((group) => group.isIncome).id

    const usedCategories = Object.values(transactions
      .filter((transaction) => {
        return transaction.categoryId !== undefined
        // Todo: filter by date
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
  }, [budget, transactions])

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

  return (
    <Container className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" className={classes.chartTitle}>
            Money flow
          </Typography>
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
