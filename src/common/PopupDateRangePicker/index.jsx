import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import Popover from '@material-ui/core/Popover'
import CalendarTodayIcon from '@material-ui/icons/CalendarToday'
import { DateRangePicker } from 'react-date-range'
import staticRanges from './staticRanges'

const PopupDateRangePicker = ({
  children,
  ranges,
  onChange,
  minDate,
  maxDate
}) => {
  const [anchorEl, setAnchorEl] = useState(null)

  const handleOpenCalendar = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseCalendar = () => {
    setAnchorEl(null)
  }

  const handleSelectDate = (range) => {
    setAnchorEl(null)
    onChange(range)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  return (
    <>
      <Button
        aria-describedby={id}
        variant="contained"
        onClick={handleOpenCalendar}
        endIcon={<CalendarTodayIcon />}
      >
        {children}
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseCalendar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <DateRangePicker
          ranges={ranges}
          onChange={handleSelectDate}
          minDate={minDate}
          maxDate={maxDate}
          inputRanges={[]}
          staticRanges={staticRanges}
        />
      </Popover>
    </>
  )
}


PopupDateRangePicker.propTypes = {
  children: PropTypes.node.isRequired,
  ranges: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  minDate: PropTypes.object.isRequired,
  maxDate: PropTypes.object.isRequired
}

export default PopupDateRangePicker
