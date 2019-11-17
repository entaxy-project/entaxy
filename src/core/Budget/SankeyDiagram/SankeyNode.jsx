import React from 'react'
import PropTypes from 'prop-types'

const SankeyNode = ({
  node,
  fill,
  handleMouseOver,
  handleMouseOut
}) => {
  let width = node.x1 - node.x0
  let height = node.y1 - node.y0 < 0 ? 0 : node.y1 - node.y0
  const alignLeft = node.data.parentId === undefined || node.isIncome

  const textPosition = {
    x: (alignLeft ? node.x1 + 8 : node.x0 - 8),
    y: node.y0 + ((height) / 2)
  }

  if (Number.isNaN(node.x0)) {
    width = 100
    textPosition.x = 0
  }

  if (Number.isNaN(node.y0)) {
    height = 100
    textPosition.y = 0
  }
  return (
    <>
      <rect
        data-type="node"
        id={`node-${node.index}`}
        data-testid={node.data.id}
        x={node.x0 || 0}
        y={node.y0 || 0}
        width={width}
        height={height || 0}
        fill={fill}
        onMouseOver={handleMouseOver}
        onFocus={handleMouseOver}
        onMouseOut={handleMouseOut}
        onBlur={handleMouseOut}
      >
        <title>{node.name}</title>
      </rect>
      <text
        x={textPosition.x}
        y={textPosition.y}
        dy=".35em"
        textAnchor={alignLeft ? 'start' : 'end'}
        fontSize="12px"
      >
        {node.name}
      </text>
    </>
  )
}

SankeyNode.propTypes = {
  node: PropTypes.object.isRequired,
  fill: PropTypes.string.isRequired,
  handleMouseOver: PropTypes.func.isRequired,
  handleMouseOut: PropTypes.func.isRequired
}

export default SankeyNode
