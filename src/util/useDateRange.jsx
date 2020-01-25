import { useState } from 'react'
import { endOfDay, startOfMonth, subMonths } from 'date-fns'

const useDateRange = (transactions) => {
  const [dateRange, setDateRange] = useState(() => {
    const minDate = transactions.length > 0 ? new Date(transactions[0].createdAt) : new Date()
    const maxDate = transactions.length > 0 ? new Date(transactions[transactions.length - 1].createdAt) : new Date()
    return {
      minDate,
      maxDate,
      startDate: subMonths(startOfMonth(maxDate), 3),
      endDate: endOfDay(maxDate),
      key: 'selection'
    }
  })

  const handleSelectDate = (ranges) => {
    setDateRange((prevState) => ({
      ...prevState,
      startDate: ranges.selection.startDate,
      endDate: endOfDay(ranges.selection.endDate)
    }))
  }

  return [dateRange, handleSelectDate]
}

export default useDateRange
