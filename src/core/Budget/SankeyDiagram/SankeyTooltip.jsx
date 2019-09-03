import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector } from 'react-redux'
import { Motion, spring } from 'react-motion'
import { currencyFormatter } from '../../../util/stringFormatter'

const useStyles = makeStyles(() => ({
  title: {
    fontWeight: 'bold'
  }
}))

const WIDTH = 200
const HEIGHT = 50

const SankeyTooltip = ({
  node,
  containerWidth
}) => {
  const classes = useStyles()
  const formatCurrency = useSelector(
    (state) => currencyFormatter(state.settings.locale, state.settings.currency)
  )
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  })

  useEffect(() => {
    if (node) {
      const newPosition = {
        x: node.x + 20,
        y: node.y + (node.height / 2),
        width: WIDTH,
        height: HEIGHT
      }
      // Show the tooltip on the left side of the node instead
      if (newPosition.x + newPosition.width > containerWidth) {
        newPosition.x -= newPosition.width + 25
      }
      setPosition(newPosition)
    } else {
      setPosition((prevState) => ({ ...prevState, width: 0, height: 0 }))
    }
  }, [node, containerWidth])

  return (
    <Motion
      defaultStyle={{
        x: position.x,
        y: position.y,
        width: position.width,
        height: position.height
      }}
      style={{
        x: spring(position.x),
        y: spring(position.y),
        width: spring(position.width),
        height: spring(position.height)
      }}
    >
      {(style) => (
        <svg
          x={style.x}
          y={style.y}
          width={style.width + 10}
          height={style.height + 10}
        >
          <defs>
            <filter id="shadow">
              <feDropShadow floodOpacity="0.3" />
            </filter>
          </defs>
          <rect
            width={style.width}
            height={style.height}
            stroke="#eee"
            fill="white"
            rx={4}
            ry={4}
            filter="url(#shadow)"
          />
          {node && (
            <>
              <text className={classes.title} x={10} y={20} data-testid="tooltipTitle">
                {node.data.name}
              </text>
              <text className={classes.amount} x={10} y={40} data-testid="tooltipTotal">
                {formatCurrency(Math.abs(node.data.total))}
              </text>
            </>
          )}
        </svg>
      )}
    </Motion>
  )
}

SankeyTooltip.propTypes = {
  node: PropTypes.object,
  containerWidth: PropTypes.number.isRequired
}

SankeyTooltip.defaultProps = {
  node: null
}

export default SankeyTooltip
