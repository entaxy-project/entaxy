import React from 'react'
import { Line } from '@vx/shape';
import { Point } from '@vx/point';
import { taxBracketData } from './TaxBrackets'
import red from 'material-ui/colors/red';
import blueGrey from 'material-ui/colors/blueGrey';

const TaxBracketLines = (
  year,
  province,
  xScale,
  yScale,
  margin,
  width,
  height
) => {
  const rows = []
  const yMax = height - margin.top - margin.bottom
  const xMax = width - margin.left - margin.right
  const data = taxBracketData(year, province)

  for(var d=0; d < data.length; d++){
    var left = xScale(data[d].income)
    var right = data[d+1] ? xScale(data[d+1].income) : xMax

    rows.push(
      <Line
        key={"bracket-" + d}
        from={new Point({x: left, y: yMax})}
        to={new Point({x: left, y: 10})}
        stroke={red[100]}
        strokeWidth={1}
      />
    )
    rows.push(
      <text
        fill={blueGrey[800]}
        textAnchor="middle"
        x={left + (right - left)/2}
        y={0}
        dy=".33em"
        fontSize={9}
        fontFamily={'Roboto'}
      >
      {data[d].tax}%
    </text>

    )
  }
  return  <g key={"TaxBracketLines"}>{rows}</g>
}

export default TaxBracketLines
