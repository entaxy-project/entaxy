/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'

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
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    display: 'inline-block'
  },
  legendLabel: {
    paddingLeft: theme.spacing(1)
  }
}))

const CustomLegend = ({
  payload,
  categories,
  handleClick,
  onMouseEnter,
  onMouseLeave
}) => {
  const classes = useStyles()
  // const budget = useSelector((state) => state.budget)

  // const groupCategories = () => {
  //   const grouped = {}
  //   payload.map((entry) => {
  //     const category = budget.categoriesById[categories[entry.dataKey].id]
  //     const group = budget.categoriesById[category.parentId]
  //     if (!(group.name in grouped)) grouped[group.name] = []
  //     grouped[group.name].push(category.name)
  //   })
  //   return grouped
  // }

  return (
    <div className={classes.legend}>
      {payload.sort((a, b) => a.dataKey.localeCompare(b.dataKey)).map((entry) => {
        const { dataKey, color } = entry
        return (
          <div
            key={`legend-${dataKey}`}
            onClick={() => handleClick(dataKey)}
            onMouseEnter={() => onMouseEnter(dataKey)}
            onMouseLeave={onMouseLeave}
            className={[
              classes.legendItem,
              categories[dataKey].selected ? null : classes.legendItemMuted
            ].join(' ')}
          >
            <span className={classes.legendDot} style={{ backgroundColor: color }} />
            <span className={classes.legendLabel}>{dataKey}</span>
          </div>
        )
      })}
    </div>
  )
}

CustomLegend.propTypes = {
  payload: PropTypes.array.isRequired,
  categories: PropTypes.object.isRequired,
  handleClick: PropTypes.func.isRequired,
  onMouseEnter: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired
}

export default CustomLegend
