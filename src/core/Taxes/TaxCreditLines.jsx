import React from 'react'
import PropTypes from 'prop-types'
import { Motion, spring } from 'react-motion'
import { Bar, Line } from '@vx/shape'
import { Point } from '@vx/point'
import { PatternLines } from '@vx/pattern'
import teal from 'material-ui/colors/teal'
import { calculateTotalTax } from './lib/TaxBrackets'

const TaxCreditLines = ({
  income,
  credits,
  country,
  year,
  region,
  xScale,
  yScale,
  margin,
  width,
  height
}) => {
  const yMax = height - margin.top - margin.bottom
  const left = {
    income: xScale(income),
    credits: xScale(income - credits)
  }
  const top = {
    income: yScale(calculateTotalTax(country, year, region, income)),
    credits: yScale(calculateTotalTax(country, year, region, income - credits))
  }
  const barWidth = Math.max((left.income - left.credits) || 0, 0)
  console.log('TaxCreditLines', yMax - top.income)

  return (
    <Motion
      defaultStyle={{
        left: left.credits || 0,
        topIncome: top.income || 0,
        topCredits: top.credits || 0,
        width: barWidth
      }}
      style={{
        left: spring(left.credits || 0),
        topIncome: spring(top.income || 0),
        topCredits: spring(top.credits || 0),
        width: spring(barWidth)
      }}
    >
      {style => (
        <g key="TaxCredits">
          <Line
            key="TaxCredit-vertical"
            from={new Point({ x: style.left, y: yMax })}
            to={new Point({ x: style.left, y: style.topCredits })}
            stroke={teal[500]}
            strokeWidth={1}
          />
          <Line
            key="TaxCredit-horizontal"
            from={new Point({ x: 0, y: style.topCredits })}
            to={new Point({ x: style.left, y: style.topCredits })}
            stroke={teal[500]}
            strokeWidth={1}
          />
          <PatternLines
            id="dLines"
            height={6}
            width={6}
            stroke="black"
            strokeWidth={1}
            orientation={['diagonal']}
          />
          <Bar
            width={style.width}
            height={yMax - style.topIncome}
            x={style.left}
            y={style.topIncome}
            fill="url(#dLines)"
            opacity={0.1}
            strokeWidth={1}
          />
          <Bar
            width={style.left}
            height={Math.max(0, style.topCredits - style.topIncome)}
            x={0}
            y={style.topIncome}
            fill="url(#dLines)"
            opacity={0.1}
            strokeWidth={1}
          />
        </g>

      )}
    </Motion>
  )
}

TaxCreditLines.propTypes = {
  income: PropTypes.number.isRequired,
  credits: PropTypes.number.isRequired,
  country: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  region: PropTypes.string,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
  margin: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired
}

export default TaxCreditLines
