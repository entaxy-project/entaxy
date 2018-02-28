import React from 'react'
import { Line } from '@vx/shape';
import { Point } from '@vx/point';
import { calculateTotalTax } from './TaxBrackets'
import { Motion, spring } from 'react-motion'
import teal from 'material-ui/colors/teal';

const IncomeLines = (
	income,
	year,
	province,
	xScale,
	yScale,
	margin,
	width,
	height
) => {
  const yMax = height - margin.top - margin.bottom
  const left = xScale(income)
  const top = yScale(calculateTotalTax(year, province, income))
	return(
    <Motion
      defaultStyle={{ left: left || 0, top: top || 0 }}
      style={{
        left: spring(left || 0),
        top: spring(top || 0)
      }}
    >
    	{style => (
		    <g key={"IncomeLines"}>
		      <Line
		        key={"IncomeLine-vertical"}
		        from={new Point({x: style.left, y: yMax})}
		        to={new Point({x: style.left, y: style.top})}
		        stroke={teal[500]}
		        strokeWidth={1}
		      />
		      <Line
		        key={"IncomeLine-horizontal"}
		        from={new Point({x: 0, y: style.top})}
		        to={new Point({x: style.left, y: style.top})}
		        stroke={teal[500]}
		        strokeWidth={1}
		      />
		      <circle
		        cx={style.left-1}
		        cy={style.top+1}
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

export default IncomeLines
