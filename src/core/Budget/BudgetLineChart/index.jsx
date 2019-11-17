/* eslint-disable react/no-multi-comp */
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
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
import Typography from '@material-ui/core/Typography'
import { currencyFormatter } from '../../../util/stringFormatter'
import CustomLegend from './CustomLegend'
import CustomTooltip from './CustomTooltip'

const BudgetLineChart = ({ data, categories, onLegendClick }) => {
  const formatCurrency = useSelector(
    (state) => currencyFormatter(state.settings.locale, state.settings.currency)
  )

  const margin = {
    top: 5,
    right: 20,
    bottom: 5,
    left: 25
  }

  const [hoverCategory, setHoverCategory] = useState(null)

  const handleMouseEnterLabel = (dataKey) => {
    setHoverCategory(dataKey)
  }

  const handleMouseLeaveLabel = () => {
    setHoverCategory(null)
  }

  if (data.length === 0) {
    return (
      <Typography>
        Not enough data to generate chart
      </Typography>
    )
  }
  return (
    <ResponsiveContainer>
      <LineChart data={data} margin={margin}>
        {Object.values(categories).map((category) => {
          let strokeWidth = 2
          if (hoverCategory) {
            strokeWidth = hoverCategory === category.name ? 4 : 1
          }
          return (
            <Line
              type="monotone"
              dataKey={category.name}
              key={category.name}
              stroke={category.colour}
              strokeWidth={strokeWidth}
            />
          )
        })}
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="date" />
        <YAxis tickFormatter={(value) => formatCurrency(value)} />
        <Tooltip
          formatter={(value, name) => [formatCurrency(value), name]}
          content={<CustomTooltip />}
        />
        <Legend
          layout="vertical"
          verticalAlign="top"
          align="right"
          wrapperStyle={{ paddingLeft: '40px', height: '100%' }}
          content={(props) => (
            <CustomLegend
              {...props}
              categories={categories}
              handleClick={onLegendClick}
              onMouseEnter={handleMouseEnterLabel}
              onMouseLeave={handleMouseLeaveLabel}
            />
          )}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

BudgetLineChart.propTypes = {
  data: PropTypes.array.isRequired,
  categories: PropTypes.object.isRequired,
  onLegendClick: PropTypes.func.isRequired
}

export default BudgetLineChart
