import React from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'

const AutoComplete = ({
  label,
  name,
  value,
  options,
  onChange
}) => (
  <Select
    placeholder={label}
    name={name}
    value={value}
    options={options}
    inputProps={{ 'aria-label': label, required: true }}
    onChange={newValue => onChange(name, newValue.label)}
    isClearable={true}
  />
)

AutoComplete.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.object.isRequired,
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
}

export default AutoComplete
