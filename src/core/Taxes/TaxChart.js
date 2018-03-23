import React from 'react'
import { extent, max, bisector } from 'd3-array';
import { Group } from '@vx/group';
import { scaleLinear } from '@vx/scale';
import { LinePath, Bar } from '@vx/shape';
import { AxisLeft, AxisBottom } from '@vx/axis';
import { curveBasis } from '@vx/curve';
import { withTooltip } from '@vx/tooltip'
import { localPoint } from '@vx/event';
import { Line } from '@vx/shape';
import { Point } from '@vx/point';

import IncomeLines from './IncomeLines'
import TaxCreditLines from './TaxCreditLines'
import TaxBracketLines from './TaxBracketLines'
import { IncomeTaxData } from './TaxBrackets'
import TaxTooltips from './TaxTooltips'

import blueGrey from 'material-ui/colors/blueGrey';

const colors = ['rgb(107, 157, 255)', 'rgb(252, 137, 159)']

const province = 'Ontario'

// Bounds
const margin = {
  top: 20,
  bottom: 40,
  left: 70,
  right: 0,
};

const TaxChart = ({
  width,
  height,
  year,
  income,
  rrsp,
  tooltipOpen,
  tooltipLeft,
  tooltipTop,
  tooltipData,
  showTooltip,
  hideTooltip,
}) => {
  const data = IncomeTaxData({year: year, province: province, income: income})
  const xMax = width - margin.left - margin.right
  const yMax = height - margin.top - margin.bottom

  const x = d => {
    if (d === undefined) {
      return 0
    } else {
      return d.income;
    }
  }
  const y = d => {
    if (d === undefined) {
      return 0
    } else {
      return d.tax;
    }
  }

  const xScale = scaleLinear({
    range: [0, xMax],
    domain: extent(data, x)
  })

  const yScale = scaleLinear({
    range: [yMax, 0],
    domain: [0, max(data, y)],
  })

  return (
    <div>
      <svg width={width} height={height} ref={s => (this.svg = s)}>
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
            label={'Tax'}
            labelOffset={50}
            labelProps={{fontFamily: 'Roboto', fontSize: 12 }}
            stroke={'#dddddd'}
            tickLabelProps={(val, i) => ({
              x: -15,
              textAnchor: 'end',
              fontFamily: 'Roboto',
              fontSize: 10
            })}
            tickFormat={yScale.tickFormat(10, "$,f")}
            tickStroke={'#dddddd'}
          />
          <AxisBottom
            scale={xScale}
            top={yMax}
            label={'Income'}
            labelProps={{fontFamily: 'Roboto', fontSize: 12 }}
            stroke={'#dddddd'}
            tickLabelProps={(val, i) => ({
              textAnchor: 'middle',
              fontFamily: 'Roboto',
              fontSize: 10
            })}
            tickFormat={xScale.tickFormat(10, "$,f")}
            tickStroke={'#dddddd'}
          />
          {TaxCreditLines(income, rrsp, year, province, xScale, yScale, margin, width, height)}
          {IncomeLines(income, year, province, xScale, yScale, margin, width, height)}
          <Bar
            data={data}
            width={width}
            height={height - margin.bottom}
            fill="transparent"
            onMouseLeave={data => event => hideTooltip()}
            onMouseMove={data => event => {
              // Figure out he data index from the mouse hover
              const { x: xPoint } = localPoint(this.svg, event);
              const x0 = xScale.invert(xPoint - margin.left) ;
              const index = bisector(d => x(d)).left(data, x0);
              showTooltip({
                tooltipData: data[index],
                tooltipLeft: xScale(x(data[index])) + margin.left,
                tooltipTop: yScale(y(data[index])) + margin.top
              });
            }}
          />
        </Group>
        {tooltipData &&
          <g key={"g-"}>
            <Line
              key={"vertical-"}
              from={new Point({x: tooltipLeft, y: yMax + margin.bottom})}
              to={new Point({x: tooltipLeft, y: margin.top})}
              stroke={"rgb(220, 220, 220)"}
            />
            <Line
              key={"horizontal-"}
              from={new Point({x: margin.left, y: tooltipTop})}
              to={new Point({x: xMax + margin.left, y: tooltipTop})}
              stroke={"rgb(220, 220, 220)"}
            />
            <circle
              cx={tooltipLeft}
              cy={tooltipTop}
              r={12}
              fill={colors[0]}
              stroke={colors[0]}
              strokeWidth=".6"
              fillOpacity={1 / 12}
              strokeOpacity={1 / 2}
            />
            {/* Inner circle */}
            <circle
              cx={tooltipLeft}
              cy={tooltipTop}
              r={4}
              fill="white"
              stroke={colors[0]}
              strokeWidth="1.5"
              fillOpacity={1}
              strokeOpacity={1}
            />
          </g>
        }
      </svg>
      {tooltipData &&
        <TaxTooltips
          tooltipOpen={tooltipOpen}
          data={tooltipData}
          top={tooltipTop}
          left={tooltipLeft}
          margin={margin}
        />}
    </div>
  )
}

export default withTooltip(TaxChart)
