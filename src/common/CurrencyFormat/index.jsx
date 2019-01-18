import React from 'react'
import PropTypes from 'prop-types'
import NumberFormat from 'react-number-format'

function CurrencyFormat(props) {
  const { inputRef, onChange, ...other } = props

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            value: values.value
          }
        })
      }}
      thousandSeparator
      prefix="$"
    />
  )
}

CurrencyFormat.propTypes = {
  inputRef: PropTypes.func,
  onChange: PropTypes.func.isRequired
}

CurrencyFormat.defaultProps = {
  inputRef: null
}

export default CurrencyFormat
