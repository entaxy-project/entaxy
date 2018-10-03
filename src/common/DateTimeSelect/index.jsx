import React from 'react'
import PropTypes from 'prop-types'
import DateFnsUtils from 'material-ui-pickers/utils/date-fns-utils'
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider'
import DateTimePicker from 'material-ui-pickers/DateTimePicker'

class DateTimeSelect extends React.Component {
  handleChange = (value) => {
    // this is going to call setFieldValue and manually update values.createdAt
    this.props.onChange(this.props.name, value)
  }

  render() {
    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <DateTimePicker
          label={this.props.label}
          inputProps={{ 'aria-label': 'Date', required: true }}
          value={this.props.value}
          name={this.props.name}
          onChange={this.handleChange}
        />
      </MuiPickersUtilsProvider>
    )
  }
}

DateTimeSelect.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}

export default DateTimeSelect
