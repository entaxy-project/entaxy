import React from 'react'
import PropTypes from 'prop-types'
import { withParentSize } from '@vx/responsive'
import { useSelector } from 'react-redux'
import { Pie } from '@vx/shape'
import { Group } from '@vx/group'
import {
  red,
  pink,
  purple,
  deepPurple,
  indigo,
  blue,
  lightBlue,
  cyan,
  teal,
  green,
  lightGreen,
  lime,
  yellow,
  amber,
  orange,
  deepOrange,
  brown,
  grey,
  blueGrey
} from '@material-ui/core/colors'

const baseColors = [
  green,
  blue,
  purple,
  yellow,
  orange,
  blueGrey,
  brown,
  red,
  indigo,
  lightBlue,
  cyan,
  pink,
  teal,
  lightGreen,
  lime,
  deepPurple,
  amber,
  deepOrange,
  grey
]

const AccountsPieChart = ({ parentWidth, totalBalance }) => {
  const accounts = useSelector(state => state.accounts)
  const data = []
  let institutionCount = 0
  for (const institution of Object.keys(accounts.byInstitution).sort()) {
    let accountCount = 0
    for (const group of Object.values(accounts.byInstitution[institution].groups)) {
      for (const accountId of group.accountIds) {
        data.push({
          label: accounts.byId[accountId].name,
          percentage: accounts.byId[accountId].currentBalance.localCurrency * 100 / totalBalance,
          colour: baseColors[institutionCount][500 - (100 * accountCount)]
        })
        accountCount += 1
      }
    }
    institutionCount += 1
  }
  const width = parentWidth
  const height = 400 // parentHeight
  const margin = {
    top: 30,
    left: 20,
    right: 20,
    bottom: 110
  }
  const radius = Math.min(width, height) / 2
  const centerY = height / 2
  const centerX = width / 2
  const white = '#ffffff'
  return (
    <div>
      <svg width={width} height={height}>
        <Group top={centerY - margin.top} left={centerX}>
          <Pie
            data={data}
            pieValue={d => d.percentage}
            outerRadius={radius - 50}
            cornerRadius={3}
            padAngle={0}
          >
            {(pie) => {
              return pie.arcs.map((arc, i) => {
                const [centroidX, centroidY] = pie.path.centroid(arc)
                const { startAngle, endAngle } = arc
                const hasSpaceForLabel = endAngle - startAngle >= 0.1
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <g key={`browser-${arc.data.label}-${i}`}>
                    <path d={pie.path(arc)} fill={arc.data.colour} />
                    {hasSpaceForLabel && (
                      <text
                        fill={white}
                        x={centroidX}
                        y={centroidY}
                        dy=".33em"
                        fontSize={9}
                        textAnchor="middle"
                      >
                        {arc.data.label}
                      </text>
                    )}
                  </g>
                )
              })
            }}
          </Pie>
        </Group>
      </svg>
    </div>
  )
}

AccountsPieChart.propTypes = {
  parentWidth: PropTypes.number.isRequired,
  totalBalance: PropTypes.number.isRequired
}

export default withParentSize(AccountsPieChart)
