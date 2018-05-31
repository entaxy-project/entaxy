import React from 'react'
import PropTypes from 'prop-types'
import { Pie } from '@vx/shape'
import { Group } from '@vx/group'

function Label({ x, y, children }) {
  return (<text textAnchor="middle" x={x} y={y} dy=".33em">{children}</text>)
}

Label.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  children: PropTypes.object.isRequired
}

const AllocationPie = (data, width, height, margin = {
  top: 30, left: 20, right: 20, bottom: 110
}) => {
  if (width < 10) return null
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
            if (endAngle - startAngle < 0.1) return null
            return <Label x={x} y={y}>{arc.data.symbol}</Label>
          }}
        />
      </Group>
    </svg>
  )
}

export default AllocationPie
