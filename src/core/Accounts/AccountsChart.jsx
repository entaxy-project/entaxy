import React from 'react'
import { useSelector } from 'react-redux'
import {
  PieChart, Pie, ResponsiveContainer, Cell, Tooltip
} from 'recharts'
import {
  red,
  pink,
  purple,
  deepPurple,
  indigo,
  blue,
  lightBlue,
  cyan,
  teal,
  green,
  lightGreen,
  lime,
  yellow,
  amber,
  orange,
  deepOrange,
  brown,
  grey,
  blueGrey
} from '@material-ui/core/colors'
import { currencyFormatter } from '../../util/stringFormatter'

const baseColors = [
  green,
  blue,
  purple,
  yellow,
  orange,
  blueGrey,
  brown,
  red,
  indigo,
  lightBlue,
  cyan,
  pink,
  teal,
  lightGreen,
  lime,
  deepPurple,
  amber,
  deepOrange,
  grey
]

const AccountsChart = () => {
  const { accounts, formatCurrency } = useSelector((state) => ({
    accounts: state.accounts,
    formatCurrency: currencyFormatter(state.settings.locale, state.settings.currency)
  }))
  const data = []
  let institutionCount = 0
  let institution
  for (institution of Object.keys(accounts.byInstitution).sort()) {
    let accountCount = 0
    let group
    for (group of Object.values(accounts.byInstitution[institution].groups)) {
      let accountId
      for (accountId of group.accountIds) {
        data.push({
          name: accounts.byId[accountId].name,
          value: accounts.byId[accountId].currentBalance.localCurrency || 0,
          colour: baseColors[institutionCount][500 - (100 * accountCount)]
        })
        accountCount += 1
      }
    }
    institutionCount += 1
  }

  return (
    <ResponsiveContainer height={200}>
      <PieChart>
        <Pie
          data={data}
          nameKey="name"
          dataKey="value"
        >
          {data.map((entry) => <Cell key={`cell-${data.name}`} fill={entry.colour} />)}
        </Pie>
        <Tooltip
          formatter={(value, name) => [formatCurrency(value), name]}
        />

      </PieChart>
    </ResponsiveContainer>
  )
}
export default AccountsChart
