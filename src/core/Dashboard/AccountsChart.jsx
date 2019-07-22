import React from 'react'
import { useSelector } from 'react-redux'
import {
  PieChart, Pie, ResponsiveContainer, Cell
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
  const accounts = useSelector(state => state.accounts)
  const data = []
  let institutionCount = 0
  for (const institution of Object.keys(accounts.byInstitution).sort()) {
    let accountCount = 0
    for (const group of Object.values(accounts.byInstitution[institution].groups)) {
      for (const accountId of group.accountIds) {
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
          {data.map(entry => <Cell key={`cell-${data.name}`} fill={entry.colour} />)}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
export default AccountsChart
