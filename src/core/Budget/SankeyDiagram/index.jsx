/* eslint-disable react/no-array-index-key */
import React from 'react'
import PropTypes from 'prop-types'
import * as d3 from 'd3'
import { sankey } from 'd3-sankey'
import chroma from 'chroma-js'
import SankeyLink from './SankeyLink'
import SankeyNode from './SankeyNode'

const SankeyDiagram = ({ data, width, height }) => {
  const { nodes, links } = sankey()
    .nodeWidth(15)
    .nodePadding(10)
    .extent([[1, 1], [width - 1, height - 5]])(data)
  const color = chroma.scale('Set3').classes(nodes.length)
  const colorScale = d3
    .scaleLinear()
    .domain([0, nodes.length])
    .range([0, 1])

  const handleMouseOver = (event) => {
    const elem = d3.select(event.target)
    if (elem.attr('data-type') === 'node') {
      elem.attr('stroke', 'black')
    } else if (elem.attr('data-type') === 'link') {
      elem.style('stroke', 'black')
    }
  }

  const handleMouseOut = (event) => {
    const elem = d3.select(event.target)
    if (elem.attr('data-type') === 'node') {
      elem.attr('stroke', 'white')
    } else if (elem.attr('data-type') === 'link') {
      elem.style('stroke', '#bbb')
    }
  }

  return (
    <g
      style={{ mixBlendMode: 'multiply' }}
      onMouseOver={handleMouseOver}
      onFocus={handleMouseOver}
      onMouseOut={handleMouseOut}
      onBlur={handleMouseOut}
    >
      {nodes.map((node, i) => (
        <SankeyNode
          node={node}
          fill={color(colorScale(i)).hex()}
          key={node.name}
        />
      ))}
      {links.map((link, i) => (
        <SankeyLink
          link={link}
          key={i}
          stroke="#bbb"
        />
      ))}
    </g>
  )
}

SankeyDiagram.propTypes = {
  data: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired
}

export default SankeyDiagram
