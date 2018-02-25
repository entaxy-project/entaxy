import React from 'react'
import { Line, Bar } from '@vx/shape';
import { Point } from '@vx/point';
import { calculateTax } from './TaxBrackets'
import { Motion, spring } from 'react-motion'
import { PatternLines } from '@vx/pattern'
import teal from 'material-ui/colors/teal';

const TaxCreditLines = (
	income,
	credits,
	year,
	xScale,
	yScale,
	margin,
	width,
	height
) => {
  const yMax = height - margin.top - margin.bottom
  const left = {
  	income: xScale(income),
  	credits: xScale(income - credits),
  }
  const top = {
  	income: yScale(calculateTax(year, income)),
  	credits: yScale(calculateTax(year, income - credits)),
  }
  var barWidth = Math.max((left.income - left.credits) || 0 , 0)
	return(
    <Motion
      defaultStyle={{ left: left.credits || 0, top: top.credits || 0, width: barWidth }}
      style={{
        left: spring(left.credits || 0),
        top: spring(top.credits || 0),
        width: spring(barWidth)
      }}
    >
    	{style => (
		    <g key={"TaxCredits"}>
		      <Line
		        key={"TaxCredit-vertical"}
		        from={new Point({x: style.left, y: yMax})}
		        to={new Point({x: style.left, y: style.top})}
		        stroke={teal[500]}
		        strokeWidth={1}
		      />
		      <Line
		        key={"TaxCredit-horizontal"}
		        from={new Point({x: 0, y: style.top})}
		        to={new Point({x: style.left, y: style.top})}
		        stroke={teal[500]}
		        strokeWidth={1}
		      />
			    <PatternLines
			      id='dLines'
			      height={6}
			      width={6}
			      stroke='black'
			      strokeWidth={1}
			      orientation={['diagonal']}
			    />
		      <Bar
			      width={style.width}
					  height={yMax - top.income}
					  x={style.left}
					  y={top.income}
					  fill={`url(#dLines)`}
					  opacity={0.1}
					  strokeWidth={1}
		      />
		      <Bar
			      width={style.left}
					  height={style.top - top.income}
					  x={0}
					  y={top.income}
					  fill={`url(#dLines)`}
					  opacity={0.1}
					  strokeWidth={1}
		      />
		    </g>

      )}
    </Motion>
	)
}

export default TaxCreditLines

