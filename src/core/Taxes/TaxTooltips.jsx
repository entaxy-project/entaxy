import React from 'react'
import PropTypes from 'prop-types'
import { Motion, spring } from 'react-motion'
import { Tooltip } from '@vx/tooltip'
import Typography from 'material-ui/Typography'

const TaxTooltips = ({
  tooltipOpen,
  data,
  top,
  left
}) => {
  const formater = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

  return (
    <Motion
      defaultStyle={{ left: left || 0, top: top || 0, opacity: 0 }}
      style={{
        left: spring(left || 0),
        top: spring(top || 0),
        opacity: spring(tooltipOpen ? 1 : 0)
      }}
    >
      {style => (
        <Tooltip
          style={{
            top: style.top,
            left: style.left,
            opacity: style.opacity,
            backgroundColor: 'white',
            color: 'rgba(25, 29, 34, 0.54)',
            padding: 12,
            fontSize: 14,
            boxShadow: '0 4px 8px 0 rgba(25, 29, 34, 0.1)',
            pointerEvents: 'none',
            borderRadius: 3,
            border: '1px solid rgba(25, 29, 34, 0.12)',
            textAlign: 'left'
          }}
        >
          <Typography>
            <strong>Your Income:</strong> {formater.format(data.income)}
          </Typography>
        </Tooltip>

      )}
    </Motion>
  )
}

TaxTooltips.propTypes = {
  tooltipOpen: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  top: PropTypes.number.isRequired,
  left: PropTypes.number.isRequired
}

export default TaxTooltips
