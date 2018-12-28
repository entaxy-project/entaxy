import React from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'

const AutoComplete = ({
  label,
  name,
  value,
  options,
  onChange,
  className
}) => (
  <Select
    placeholder={label}
    name={name}
    value={value}
    defaultValue={value}
    options={options}
    inputProps={{ 'aria-label': label, required: true }}
    onChange={selection => onChange(name, selection)}
    isClearable={true}
    className={className}
  />
)

AutoComplete.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.object,
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string
}

AutoComplete.defaultProps = {
  value: null,
  className: null
}

export default AutoComplete
