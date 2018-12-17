import React from 'react'
import PropTypes from 'prop-types'
import DateFnsUtils from 'material-ui-pickers/utils/date-fns-utils'
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider'
import DateTimePicker from 'material-ui-pickers/DateTimePicker'

const DateTimeSelect = ({
  label,
  name,
  value,
  onChange
}) => (
  <MuiPickersUtilsProvider utils={DateFnsUtils}>
    <DateTimePicker
      label={label}
      inputProps={{ 'aria-label': label, required: true }}
      value={value}
      name={name}
      onChange={newValue => onChange(name, newValue)}
    />
  </MuiPickersUtilsProvider>
)

DateTimeSelect.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}

export default DateTimeSelect
