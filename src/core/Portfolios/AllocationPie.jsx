import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Pie } from '@vx/shape'
import { Group } from '@vx/group'
import { portfolioPieChartSelector } from '../../store/transactions/selectors'

const mapStateToProps = (state) => {
  return {
    data: portfolioPieChartSelector(state)
  }
}

const AllocationPie = ({ data }) => {
  const width = 400
  const height = 400
  const margin = {
    top: 30,
    left: 20,
    right: 20,
    bottom: 110
  }
  const radius = Math.min(width, height) / 2
  return (
    <svg width={width} height={height}>
      <rect
        x={0}
        y={0}
        rx={14}
        width={width}
        height={height}
        fill="url('#gradients')"
      />
      <Group top={(height / 2) - margin.top} left={width / 2}>
        <Pie
          data={data}
          pieValue={d => d.percentage}
          outerRadius={radius - 60}
          innerRadius={0}
          fillOpacity={d => 1 / (d.index + 2)}
          padAngle={0}
          centroid={(centroid, arc) => {
            const [x, y] = centroid
            const { startAngle, endAngle } = arc
            if (endAngle - startAngle < 0.01) return null
            return (
              <text
                textAnchor="middle"
                x={x}
                y={y}
                dy=".33em"
                fontSize={12}
                fontFamily="Roboto"
              >
                {arc.data.ticker}
              </text>
            )
          }}
        />
      </Group>
    </svg>
  )
}

AllocationPie.propTypes = {
  data: PropTypes.array.isRequired
}

export default connect(mapStateToProps)(AllocationPie)
