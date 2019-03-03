import React from 'react'
import PropTypes from 'prop-types'
import { Motion, spring } from 'react-motion'
import { Tooltip } from '@vx/tooltip'

const TaxTooltips = ({
  data,
  top,
  left
}) => {
  const formater = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
  return (
    <Motion
      defaultStyle={{ left, top }}
      style={{
        left: spring(left),
        top: spring(top)
      }}
    >
      {style => (
        <Tooltip
          style={{
            top: style.top,
            left: style.left,
            backgroundColor: 'white',
            color: 'black',
            padding: 12,
            fontSize: 12,
            fontFamily: 'Roboto',
            boxShadow: '0 4px 8px 0 rgba(25, 29, 34, 0.1)',
            pointerEvents: 'none',
            borderRadius: 4,
            border: '1px solid rgba(25, 29, 34, 0.12)',
            textAlign: 'left'
          }}
        >
          <strong>Your Income:</strong>
          {formater.format(data.income)}
        </Tooltip>

      )}
    </Motion>
  )
}

TaxTooltips.propTypes = {
  data: PropTypes.object.isRequired,
  top: PropTypes.number.isRequired,
  left: PropTypes.number.isRequired
}

export default TaxTooltips
