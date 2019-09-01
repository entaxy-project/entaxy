import React from 'react'
import PropTypes from 'prop-types'
import { sankeyLinkHorizontal } from 'd3-sankey'

const SankeyLink = ({
  link,
  stroke,
  handleMouseOver,
  handleMouseOut
}) => (
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
    onMouseOver={handleMouseOver}
    onFocus={handleMouseOver}
    onMouseOut={handleMouseOut}
    onBlur={handleMouseOut}
  />
)

SankeyLink.propTypes = {
  link: PropTypes.object.isRequired,
  stroke: PropTypes.string.isRequired,
  handleMouseOver: PropTypes.func.isRequired,
  handleMouseOut: PropTypes.func.isRequired
}

export default SankeyLink
