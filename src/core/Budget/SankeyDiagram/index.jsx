/* eslint-disable react/no-array-index-key */
import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import * as d3 from 'd3'
import { sankey } from 'd3-sankey'
import chroma from 'chroma-js'
import SankeyLink from './SankeyLink'
import SankeyNode from './SankeyNode'
import SankeyTooltip from './SankeyTooltip'

const SankeyDiagram = ({ data }) => {
  const [rect, setRect] = useState({ width: 200, height: 400 })
  const [selectedNode, setSelectedNode] = useState(null)
  const { nodes, links } = sankey()
    .nodeWidth(15)
    .nodePadding(16)
    .extent([[1, 10], [rect.width - 1, rect.height - 10]])(data)
  const color = chroma.scale('Set3').classes(nodes.length)
  const colorScale = d3
    .scaleLinear()
    .domain([0, nodes.length])
    .range([0, 1])

  const svgRef = useCallback((node) => {
    const measureSVG = () => {
      const { width, height } = node.getBoundingClientRect()
      if (width > 0 && height > 0) setRect({ width, height })
    }

    if (node !== null) {
      measureSVG()
      window.addEventListener('resize', measureSVG)
    } else {
      window.removeEventListener('resize', measureSVG)
    }
  }, [])

  const handleMouseOver = (event, node) => {
    const elem = d3.select(event.target)
    switch (elem.attr('data-type')) {
      case 'node':
        elem.attr('stroke', 'black')
        setSelectedNode({
          data: node.data,
          x: parseInt(elem.attr('x'), 10),
          y: parseInt(elem.attr('y'), 10),
          width: parseInt(elem.attr('width'), 10),
          height: parseInt(elem.attr('height'), 10)
        })
        break
      case 'link':
        elem.style('stroke', 'black')
        break
      // no default
    }
  }

  const handleMouseOut = (event) => {
    setSelectedNode(null)
    const elem = d3.select(event.target)
    switch (elem.attr('data-type')) {
      case 'node':
        elem.attr('stroke', 'white')
        break
      case 'link':
        elem.style('stroke', '#bbb')
        break
      // no default
    }
  }

  return (
    <svg width="100%" height="100%" ref={svgRef} data-testid="svg">
      {rect.width > 0 && rect.height > 0 && (
        <g style={{ mixBlendMode: 'multiply' }}>
          {nodes.map((node, i) => {
            return (
              <SankeyNode
                node={node}
                fill={color(colorScale(i)).hex()}
                key={node.name}
                handleMouseOver={(event) => handleMouseOver(event, node)}
                handleMouseOut={handleMouseOut}
              />
            )
          })}
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
            node={selectedNode}
            containerWidth={rect.width}
            containerHeight={rect.height}
          />
        </g>
      )}
    </svg>
  )
}

SankeyDiagram.propTypes = {
  data: PropTypes.object.isRequired
}

export default SankeyDiagram
