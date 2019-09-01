import React from 'react'
import PropTypes from 'prop-types'

const SankeyNode = ({
  node,
  fill,
  handleMouseOver,
  handleMouseOut
}) => {
  const width = node.x1 - node.x0
  const height = node.y1 - node.y0 < 0 ? 0 : node.y1 - node.y0
  // console.log('height', height)
  const alignLeft = node.data.parentId === undefined || node.isIncome
  return (
    <>
      <rect
        data-type="node"
        id={`node-${node.index}`}
        x={node.x0}
        y={node.y0}
        width={width}
        height={height}
        fill={fill}
        onMouseOver={handleMouseOver}
        onFocus={handleMouseOver}
        onMouseOut={handleMouseOut}
        onBlur={handleMouseOut}
      >
        <title>{node.name}</title>
      </rect>
      <text
        x={alignLeft ? node.x1 + 8 : node.x0 - 8}
        y={node.y0 + ((height) / 2)}
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
