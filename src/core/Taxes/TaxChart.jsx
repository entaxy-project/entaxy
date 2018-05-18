import React from 'react'
import PropTypes from 'prop-types'
import { withParentSize } from '@vx/responsive'
import { extent, max } from 'd3-array'
import { Group } from '@vx/group'
import { scaleLinear } from '@vx/scale'
import { LinePath } from '@vx/shape'
import { AxisBottom, AxisLeft } from '@vx/axis'
import { curveBasis } from '@vx/curve'
import blueGrey from '@material-ui/core/colors/blueGrey'

import IncomeLines from './IncomeLines'
import TaxCreditLines from './TaxCreditLines'
import TaxBracketLines from './TaxBracketLines'
import { TaxBrackets, incomeTaxData } from './lib/TaxBrackets'
import TaxTooltips from './TaxTooltips'

// Bounds
const margin = {
  top: 20,
  bottom: 40,
  left: 70,
  right: 0
}

const x = d => d.income
const y = d => d.tax

const TaxChart = ({
  parentWidth,
  parentHeight,
  country,
  year,
  region,
  income,
  rrsp,
  taxBeforeCredits
}) => {
  const width = parentWidth
  const height = parentHeight - margin.bottom
  const xMax = width - margin.left - margin.right
  const yMax = height - margin.top - margin.bottom
  const data = incomeTaxData(TaxBrackets[country][year], region, income)
  const xScale = scaleLinear({ range: [0, xMax], domain: extent(data, x) })
  const yScale = scaleLinear({ range: [yMax, 0], domain: [0, max(data, y)] })

  return (
    <div>
      <svg width={width} height={height}>
        <Group top={margin.top} left={margin.left}>
          <TaxBracketLines
            country={country}
            year={year}
            region={region}
            xScale={xScale}
            yScale={yScale}
            margin={margin}
            width={width}
            height={height}
          />
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
          <TaxCreditLines
            income={income}
            credits={rrsp}
            country={country}
            year={year}
            region={region}
            xScale={xScale}
            yScale={yScale}
            margin={margin}
            width={width}
            height={height}
          />
          <IncomeLines
            income={income}
            country={country}
            year={year}
            region={region}
            xScale={xScale}
            yScale={yScale}
            margin={margin}
            width={width}
            height={height}
          />
        </Group>
      </svg>
      <TaxTooltips
        data={{ income, tax: taxBeforeCredits }}
        top={yScale(taxBeforeCredits) + 100}
        left={Math.min(xMax - 100, xScale(income) + margin.left)}
      />
    </div>
  )
}

TaxChart.propTypes = {
  parentWidth: PropTypes.number.isRequired,
  parentHeight: PropTypes.number.isRequired,
  country: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  region: PropTypes.string,
  income: PropTypes.number.isRequired,
  rrsp: PropTypes.number.isRequired,
  taxBeforeCredits: PropTypes.number.isRequired
}

TaxChart.defaultProps = {
  region: null
}

export default withParentSize(TaxChart)
