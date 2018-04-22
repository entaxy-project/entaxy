import React from 'react'
import PropTypes from 'prop-types'
import { Line } from '@vx/shape'
import { Point } from '@vx/point'
import { Motion, spring } from 'react-motion'
import teal from 'material-ui/colors/teal'
import { TaxBrackets, calculateTotalTax } from './lib/TaxBrackets'

const IncomeLines = ({
  income,
  country,
  year,
  region,
  xScale,
  yScale,
  margin,
  height
}) => {
  const yMax = height - margin.top - margin.bottom
  const left = xScale(income)
  const top = yScale(calculateTotalTax(TaxBrackets[country][year], region, income))

  return (
    <Motion
      defaultStyle={{ left: left || 0, top: top || 0 }}
      style={{
        left: spring(left || 0),
        top: spring(top || 0)
      }}
    >
      {style => (
        <g key="IncomeLines">
          <Line
            key="IncomeLine-vertical"
            from={new Point({ x: style.left, y: yMax })}
            to={new Point({ x: style.left, y: style.top })}
            stroke={teal[500]}
            strokeWidth={1}
          />
          <Line
            key="IncomeLine-horizontal"
            from={new Point({ x: 0, y: style.top })}
            to={new Point({ x: style.left, y: style.top })}
            stroke={teal[500]}
            strokeWidth={1}
          />
          <circle
            cx={style.left - 1}
            cy={style.top + 1}
            r={4}
            fill="white"
            stroke={teal[500]}
            strokeWidth="1.5"
            fillOpacity={1}
            strokeOpacity={1}
          />
        </g>
      )}
    </Motion>
  )
}

IncomeLines.propTypes = {
  income: PropTypes.number.isRequired,
  country: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  region: PropTypes.string,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
  margin: PropTypes.object.isRequired,
  height: PropTypes.number.isRequired
}

IncomeLines.defaultProps = {
  region: null
}

export default IncomeLines
