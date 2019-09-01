/* eslint-disable react/no-array-index-key */
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import * as d3 from 'd3'
import { sankey } from 'd3-sankey'
import chroma from 'chroma-js'
import SankeyLink from './SankeyLink'
import SankeyNode from './SankeyNode'
import SankeyTooltip from './SankeyTooltip'

const SankeyDiagram = ({ data, width, height }) => {
  const tooltipWidth = 200
  const tooltipHeight = 50
  const [tooltip, setTooltip] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    data: {}
  })
  const { nodes, links } = sankey()
    .nodeWidth(15)
    .nodePadding(16)
    .extent([[1, 10], [width - 1, height - 10]])(data)
  const color = chroma.scale('Set3').classes(nodes.length)
  const colorScale = d3
    .scaleLinear()
    .domain([0, nodes.length])
    .range([0, 1])

  const handleMouseOver = (event, item) => {
    const elem = d3.select(event.target)
    // const index = parseInt(event.target.id.substring(5), 10)
    if (elem.attr('data-type') === 'node') {
      elem.attr('stroke', 'black')
      const tooltipData = {
        x: parseInt(elem.attr('x'), 10) + 20,
        y: parseInt(elem.attr('y'), 10) + (parseInt(elem.attr('height'), 10) / 2),
        width: tooltipWidth,
        height: tooltipHeight,
        data: item.data
      }
      if (tooltipData.x + tooltipData.width > width) {
        tooltipData.x -= tooltipData.width + 25
      }
      setTooltip(tooltipData)
    } else if (elem.attr('data-type') === 'link') {
      elem.style('stroke', 'black')
    }
  }

  const handleMouseOut = (event) => {
    setTooltip((prevState) => ({ ...prevState, width: 0, height: 0 }))
    const elem = d3.select(event.target)
    if (elem.attr('data-type') === 'node') {
      elem.attr('stroke', 'white')
    } else if (elem.attr('data-type') === 'link') {
      elem.style('stroke', '#bbb')
    }
  }
  return (
    <g style={{ mixBlendMode: 'multiply' }}>
      {nodes.map((node, i) => (
        <SankeyNode
          node={node}
          fill={color(colorScale(i)).hex()}
          key={node.name}
          handleMouseOver={(event) => handleMouseOver(event, node)}
          handleMouseOut={handleMouseOut}
        />
      ))}
      {links.map((link, i) => (
        <SankeyLink
          link={link}
          key={i}
          stroke="#bbb"
          handleMouseOver={(event) => handleMouseOver(event, link)}
          handleMouseOut={handleMouseOut}
        />
      ))}
      <SankeyTooltip
        x={tooltip.x}
        y={tooltip.y}
        width={tooltip.width}
        height={tooltip.height}
        data={tooltip.data}
      />
    </g>
  )
}

SankeyDiagram.propTypes = {
  data: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired
}

export default SankeyDiagram
