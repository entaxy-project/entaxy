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
    categories,
    colours,
    formatCurrency
  } = useSelector(state => ({
    settings: state.settings,
    transactions: state.transactions,
    categories: [...new Set(Object.values(state.budget.rules).map(rules => rules.category))],
    colours: state.budget.colours,
    formatCurrency: currencyFormatter(state.settings.locale, state.settings.currency)

  }))

  const initialState = categories.reduce(
    (res, cat) => ({ ...res, [cat]: 1 }),
    {}
  )
  const [opacity, setOpacity] = useState(initialState)

  const byMonth = {}
  transactions.list.forEach((transaction) => {
    const dateKey = startOfMonth(transaction.createdAt)
    if (transaction.category !== undefined) {
      if (byMonth[dateKey] === undefined) {
        byMonth[dateKey] = categories.reduce((res, cat) => ({ ...res, [cat]: 0 }), {})
      }
      if (byMonth[dateKey][transaction.category] === undefined) {
        byMonth[dateKey][transaction.category] = 0
      }
      byMonth[dateKey][transaction.category] += Math.abs(transaction.amount)
    }
  })
  const data = Object.keys(byMonth).sort((a, b) => a - b).map(date => ({
    date: format(date, 'MMM YYYY'),
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
      categories.reduce((res, value) => ({
        ...res,
        [value]: value === obj.dataKey ? 1 : 0.3
      }), {})
    )
  }
  const handleMouseLeave = () => {
    setOpacity(
      categories.reduce((res, value) => ({
        ...res,
        [value]: 1
      }), {})
    )
  }

  return (
    <ResponsiveContainer>
      <LineChart data={data} margin={margin}>
        { categories.map(category => (
          <Line
            type="monotone"
            dataKey={category}
            key={category}
            stroke={colours[category]}
            strokeOpacity={opacity[category]}
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
