import React from 'react'
import PropTypes from 'prop-types'
import { sankeyLinkHorizontal } from 'd3-sankey'

const SankeyLink = ({ link, stroke }) => (
  <path
    data-type="link"
    id={`link-${link.index}`}
    d={sankeyLinkHorizontal()(link)}
    style={{
      fill: 'none',
      strokeOpacity: '.3',
      stroke,
      strokeWidth: Math.max(1, link.width)
    }}
  />
)

SankeyLink.propTypes = {
  link: PropTypes.string.isRequired,
  stroke: PropTypes.string.isRequired
}

export default SankeyLink
