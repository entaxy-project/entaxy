import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import {
  PieChart, Pie, ResponsiveContainer, Cell, Tooltip
} from 'recharts'
import { currencyFormatter } from '../../util/stringFormatter'

const AccountsChart = ({ data, filter }) => {
  const formatCurrency = useSelector((state) => currencyFormatter(state.settings.locale, state.settings.currency))

  return (
    <ResponsiveContainer height={200}>
      <PieChart>
        <Pie
          data={data}
          nameKey="name"
          dataKey="value"
          isAnimationActive={false}
          innerRadius="40%"
          paddingAngle={1}
        >
          {data.map((entry) => <Cell key={`cell-${data.name}`} fill={entry.colour} />)}
        </Pie>
        <Tooltip
          formatter={(value, name) => [
            formatCurrency(filter === 'Assets' ? value : -value),
            name
          ]}
        />

      </PieChart>
    </ResponsiveContainer>
  )
}

AccountsChart.propTypes = {
  data: PropTypes.array.isRequired,
  filter: PropTypes.string.isRequired
}

export default AccountsChart
