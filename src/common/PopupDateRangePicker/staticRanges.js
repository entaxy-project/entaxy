import { createStaticRanges } from 'react-date-range'
import {
  addDays,
  endOfDay,
  startOfDay,
  startOfMonth,
  endOfMonth,
  addMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns'

const defineds = {
  startOfWeek: startOfWeek(new Date()),
  endOfWeek: endOfWeek(new Date()),
  startOfLastWeek: startOfWeek(addDays(new Date(), -7)),
  endOfLastWeek: endOfWeek(addDays(new Date(), -7)),
  startOfToday: startOfDay(new Date()),
  endOfToday: endOfDay(new Date()),
  startOfYesterday: startOfDay(addDays(new Date(), -1)),
  endOfYesterday: endOfDay(addDays(new Date(), -1)),
  startOfMonth: startOfMonth(new Date()),
  endOfMonth: endOfMonth(new Date()),
  startOfLastMonth: startOfMonth(addMonths(new Date(), -1)),
  endOfLastMonth: endOfMonth(addMonths(new Date(), -1)),
  startOfLastQuarter: startOfMonth(addMonths(new Date(), -3)),
  startOfLastSemester: startOfMonth(addMonths(new Date(), -6)),
  startOfLastYear: startOfMonth(addMonths(new Date(), -12))
}

export default createStaticRanges([
  {
    label: 'This Week',
    range: () => ({
      startDate: defineds.startOfWeek,
      endDate: defineds.endOfWeek
    })
  },
  {
    label: 'Last Week',
    range: () => ({
      startDate: defineds.startOfLastWeek,
      endDate: defineds.endOfLastWeek
    })
  },
  {
    label: 'This Month',
    range: () => ({
      startDate: defineds.startOfMonth,
      endDate: defineds.endOfMonth
    })
  },
  {
    label: 'Last Month',
    range: () => ({
      startDate: defineds.startOfLastMonth,
      endDate: defineds.endOfLastMonth
    })
  },
  {
    label: 'Last 3 Months',
    range: () => ({
      startDate: defineds.startOfLastQuarter,
      endDate: defineds.endOfToday
    })
  },
  {
    label: 'Last 6 Months',
    range: () => ({
      startDate: defineds.startOfLastSemester,
      endDate: defineds.endOfToday
    })
  },
  {
    label: 'Last 12 Months',
    range: () => ({
      startDate: defineds.startOfLastYear,
      endDate: defineds.endOfToday
    })
  }
])
