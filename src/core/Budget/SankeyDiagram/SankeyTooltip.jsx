import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector } from 'react-redux'
import { Motion, spring } from 'react-motion'
import { currencyFormatter } from '../../../util/stringFormatter'

const useStyles = makeStyles(() => ({
  title: {
    fontWeight: 'bold'
  }
}))

const SankeyTooltip = ({
  x,
  y,
  width,
  height,
  data
}) => {
  const classes = useStyles()
  const formatCurrency = useSelector(
    (state) => currencyFormatter(state.settings.locale, state.settings.currency)
  )

  return (
    <Motion
      defaultStyle={{
        x,
        y,
        width,
        height
      }}
      style={{
        x: spring(x),
        y: spring(y),
        width: spring(width),
        height: spring(height)
      }}
    >
      {(style) => (
        <svg
          x={style.x}
          y={style.y}
          width={style.width}
          height={style.height}
        >
          <rect
            width={style.width}
            height={style.height}
            stroke="black"
            fill="white"
          />
          <text className={classes.title} x={10} y={20}>
            {data.name}
          </text>
          <text className={classes.amount} x={10} y={40}>
            {formatCurrency(Math.abs(data.total))}
          </text>
        </svg>
      )}
    </Motion>
  )
}

SankeyTooltip.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  data: PropTypes.object.isRequired
}

export default SankeyTooltip
