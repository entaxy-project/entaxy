import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { format, startOfMonth } from 'date-fns'
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { currencyFormatter } from '../../util/stringFormatter'

const BudgetChart = () => {
  const {
    settings,
    transactions,
    budget,
    formatCurrency
  } = useSelector((state) => ({
    settings: state.settings,
    transactions: state.transactions,
    budget: state.budget,
    formatCurrency: currencyFormatter(state.settings.locale, state.settings.currency)

  }))

  // Used categories except Income
  const categorizedTransactions = transactions.list.filter((transaction) => transaction.categoryId !== undefined)
  const usedCategories = [
    ...new Set(
      categorizedTransactions
        .map((transaction) => budget.categoriesById[transaction.categoryId])
    )
  ].filter((category) => !budget.categoriesById[category.parentId].isIncome)

  const initialState = usedCategories.reduce(
    (res, cat) => ({ ...res, [cat]: 1 }),
    {}
  )
  const [opacity, setOpacity] = useState(initialState)

  const byMonth = {}
  categorizedTransactions.forEach((transaction) => {
    const dateKey = startOfMonth(transaction.createdAt).getTime()
    const category = budget.categoriesById[transaction.categoryId]
    const group = budget.categoriesById[category.parentId]
    if (!group.isIncome) {
      if (byMonth[dateKey] === undefined) {
        byMonth[dateKey] = usedCategories.reduce((res, cat) => ({ ...res, [cat.name]: 0 }), {})
      }
      if (byMonth[dateKey][category.name] === undefined) {
        byMonth[dateKey][category.name] = 0
      }
      byMonth[dateKey][category.name] += Math.abs(transaction.amount)
    }
  })
  const data = Object.keys(byMonth).sort((a, b) => a - b).map((date) => ({
    date: format(parseInt(date, 10), 'MMM YYYY'),
    ...byMonth[date]
  }))
  const margin = {
    top: 5,
    right: 20,
    bottom: 5,
    left: 20
  }

  const handleMouseEnter = (obj) => {
    setOpacity(
      usedCategories.reduce((res, category) => ({
        ...res,
        [category.name]: category.name === obj.dataKey ? 1 : 0.3
      }), {})
    )
  }
  const handleMouseLeave = () => {
    setOpacity(
      usedCategories.reduce((res, category) => ({
        ...res,
        [category.name]: 1
      }), {})
    )
  }

  return (
    <ResponsiveContainer>
      <LineChart data={data} margin={margin}>
        { usedCategories.map((category) => (
          <Line
            type="monotone"
            dataKey={category.name}
            key={category.name}
            stroke={category.colour}
            strokeOpacity={opacity[category.name]}
            strokeWidth={2}
          />
        ))}
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="date" />
        <YAxis label={{ value: settings.currency, angle: -90, position: 'insideLeft' }} />
        <Tooltip
          formatter={(value, name) => [formatCurrency(value), name]}
        />
        <Legend
          layout="vertical"
          verticalAlign="top"
          align="right"
          wrapperStyle={{ paddingLeft: '40px' }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default BudgetChart
