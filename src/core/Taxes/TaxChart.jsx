import React from 'react'
import PropTypes from 'prop-types'
import { extent, max } from 'd3-array'
import { Group } from '@vx/group'
import { scaleLinear } from '@vx/scale'
import { LinePath } from '@vx/shape'
import { AxisBottom, AxisLeft } from '@vx/axis'
import { curveBasis } from '@vx/curve'
import blueGrey from 'material-ui/colors/blueGrey'

import IncomeLines from './IncomeLines'
import TaxCreditLines from './TaxCreditLines'
import TaxBracketLines from './TaxBracketLines'
import { IncomeTaxData } from './lib/TaxBrackets'
import TaxTooltips from './TaxTooltips'

const province = 'Ontario'

// Bounds
const margin = {
  top: 20,
  bottom: 40,
  left: 70,
  right: 0
}

const TaxChart = ({
  width,
  height,
  year,
  income,
  rrsp,
  taxAmount
}) => {
  const data = IncomeTaxData({ year, province, income })
  const xMax = width - margin.left - margin.right
  const yMax = height - margin.top - margin.bottom

  const x = (d) => {
    if (d === undefined) {
      return 0
    }
    return d.income
  }
  const y = (d) => {
    if (d === undefined) {
      return 0
    }
    return d.tax
  }

  const xScale = scaleLinear({
    range: [0, xMax],
    domain: extent(data, x)
  })

  const yScale = scaleLinear({
    range: [yMax, 0],
    domain: [0, max(data, y)]
  })

  return (
    <div>
      <svg width={width} height={height}>
        <Group top={margin.top} left={margin.left}>
          {TaxBracketLines(year, province, xScale, yScale, margin, width, height)}
          <LinePath
            data={data}
            xScale={xScale}
            yScale={yScale}
            x={x}
            y={y}
            stroke={blueGrey[100]}
            strokeWidth={4}
            curve={curveBasis}
          />
          <AxisLeft
            scale={yScale}
            top={0}
            left={0}
            label="Tax"
            labelOffset={50}
            labelProps={{ fontFamily: 'Roboto', fontSize: 12 }}
            stroke="#dddddd"
            tickLabelProps={() => ({
              x: -15,
              textAnchor: 'end',
              fontFamily: 'Roboto',
              fontSize: 10
            })}
            tickFormat={yScale.tickFormat(10, '$,f')}
            tickStroke="#dddddd"
          />
          <AxisBottom
            scale={xScale}
            top={yMax}
            label="Income"
            labelProps={{ fontFamily: 'Roboto', fontSize: 12 }}
            stroke="#dddddd"
            tickLabelProps={() => ({
              textAnchor: 'middle',
              fontFamily: 'Roboto',
              fontSize: 10
            })}
            tickFormat={xScale.tickFormat(10, '$,f')}
            tickStroke="#dddddd"
          />
          {TaxCreditLines(income, rrsp, year, province, xScale, yScale, margin, width, height)}
          {IncomeLines(income, year, province, xScale, yScale, margin, width, height)}
        </Group>
      </svg>
      <TaxTooltips
        tooltipOpen={true}
        data={{ income, tax: taxAmount }}
        top={yScale(taxAmount) + margin.bottom}
        left={xScale(income) + margin.left}
      />
    </div>
  )
}

TaxChart.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  year: PropTypes.number.isRequired,
  income: PropTypes.number.isRequired,
  rrsp: PropTypes.number.isRequired,
  taxAmount: PropTypes.number.isRequired
}

export default TaxChart
