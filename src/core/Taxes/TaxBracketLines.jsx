import React from 'react'
import PropTypes from 'prop-types'
import { Line } from '@vx/shape'
import { Point } from '@vx/point'
import red from 'material-ui/colors/red'
import blueGrey from 'material-ui/colors/blueGrey'
import { TaxBrackets, taxBracketData } from './lib/TaxBrackets'

const TaxBracketLines = ({
  country,
  year,
  region,
  xScale,
  margin,
  width,
  height
}) => {
  const rows = []
  const yMax = height - margin.top - margin.bottom
  const xMax = width - margin.left - margin.right
  const data = taxBracketData(TaxBrackets[country][year], region)

  for (let d = 0; d < data.length; d += 1) {
    const left = xScale(data[d].income)
    const right = data[d + 1] ? xScale(data[d + 1].income) : xMax

    const line = (
      <Line
        key={`bracket-line${d}`}
        from={new Point({ x: left, y: yMax })}
        to={new Point({ x: left, y: 10 })}
        stroke={red[100]}
        strokeWidth={1}
      />
    )

    const text = (
      <text
        key={`bracket-text${d}`}
        fill={blueGrey[800]}
        textAnchor="middle"
        x={left + ((right - left) / 2)}
        y={0}
        dy=".33em"
        fontSize={9}
        fontFamily="Roboto"
      >
        {data[d].tax}
      </text>
    )

    rows.push(line)
    rows.push(text)
  }
  return <g key="TaxBracketLines">{rows}</g>
}

TaxBracketLines.propTypes = {
  country: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  region: PropTypes.string,
  xScale: PropTypes.func.isRequired,
  margin: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired
}

TaxBracketLines.defaultProps = {
  region: null
}

export default TaxBracketLines
