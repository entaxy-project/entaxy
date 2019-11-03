/* eslint-disable react/prop-types */
/* eslint-disable react/no-multi-comp */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import { format, startOfMonth } from 'date-fns'
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Surface,
  Symbols
} from 'recharts'
import { currencyFormatter } from '../../util/stringFormatter'

const useStyles = makeStyles((theme) => ({
  legend: {
    height: 'calc(100% - 30px)',
    overflowY: 'scroll'
  },
  legendItem: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    cursor: 'pointer',
    '&:hover': {
      background: theme.palette.action.hover
    }
  },
  legendItemMuted: {
    opacity: 0.3
  },
  legendLabel: {
    paddingLeft: theme.spacing(1)
  }
}))

const BudgetChart = () => {
  const classes = useStyles()
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

  const [hoverCategory, setHoverCategory] = useState(null)
  const [categories, setCategories] = useState(usedCategories.reduce(
    (res, cat) => ({ ...res, [cat.name]: true }),
    {}
  ))

  const byMonth = {}
  const byMonth = useCallback(() => {
    doSomething(a, b);
  }, [categorizedTransactions])

  categorizedTransactions.forEach((transaction) => {
    console.log('byMnth')
    const dateKey = startOfMonth(transaction.createdAt).getTime()
    const category = budget.categoriesById[transaction.categoryId]
    const group = budget.categoriesById[category.parentId]
    if (!group.isIncome && categories[category.name]) {
      if (byMonth[dateKey] === undefined) {
        byMonth[dateKey] = usedCategories.reduce((res, cat) => ({ ...res, [cat.name]: 0 }), {})
      }
      if (byMonth[dateKey][category.name] === undefined) {
        byMonth[dateKey][category.name] = 0
      }
      byMonth[dateKey][category.name] += -transaction.amount.localCurrency
    }
  })
  const data = Object.keys(byMonth).sort((a, b) => a - b).map((date) => ({
    date: format(parseInt(date, 10), 'MMM yyyy'),
    ...byMonth[date]
  }))
  const margin = {
    top: 5,
    right: 20,
    bottom: 5,
    left: 20
  }

  const handleMouseEnter = (dataKey) => {
    setHoverCategory(dataKey)
    // setCategories(
    //   usedCategories.reduce((res, category) => ({
    //     ...res,
    //     [category.name]: {
    //       ...categories[category.name],
    //       opacity: category.name === dataKey ? 1 : 0.3
    //     }
    //   }), {})
    // )
  }

  const handleMouseLeave = () => {
    setHoverCategory(null)

    // setCategories(
    //   usedCategories.reduce((res, category) => ({
    //     ...res,
    //     [category.name]: {
    //       ...categories[category.name],
    //       opacity: 1
    //     }
    //   }), {})
    // )
  }

  const handleClick = (dataKey) => {
    setCategories((prevState) => ({
      ...prevState,
      [dataKey]: { ...prevState[dataKey], selected: !prevState[dataKey].selected }
    }))
  }

  // const handleMouseOver = (e) => {
  //   console.log(e)
  // }

  const renderCustomLegend = ({ payload }) => {
    return (
      <div className={classes.legend}>
        {payload.map((entry) => {
          const { dataKey, color } = entry
          return (
            <div
              key={`overlay-${dataKey}`}
              onClick={() => handleClick(dataKey)}
              className={[classes.legendItem, categories[dataKey] ? null : classes.legendItemMuted].join(' ')}
            >
              <Surface width={10} height={10}>
                <Symbols cx={5} cy={5} type="circle" size={50} fill={color} />
              </Surface>
              <span className={classes.legendLabel}>{dataKey}</span>
            </div>
          )
        })}
      </div>
    )
  }

  const renderCustomTooltip = (props) => {
    return (
      <div>test</div>
    )
  }

  return (
    <ResponsiveContainer>
      <LineChart data={data} margin={margin}>
        {usedCategories.map((category) => (
          <Line
            type="monotone"
            dataKey={category.name}
            key={category.name}
            stroke={category.colour}
            strokeWidth={2}
          />
        ))}
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="date" />
        <YAxis label={{ value: settings.currency, angle: -90, position: 'insideLeft' }} />
        <Tooltip
          formatter={(value, name) => [formatCurrency(value), name]}
          content={renderCustomTooltip}
        />
        <Legend
          layout="vertical"
          verticalAlign="top"
          align="right"
          wrapperStyle={{ paddingLeft: '40px', height: '100%' }}
          content={renderCustomLegend}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default BudgetChart
