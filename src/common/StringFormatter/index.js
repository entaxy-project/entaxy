export const currencyFormatter = ({ locale = 'en-CA', currency = 'CAD' }) => (
  new Intl.NumberFormat(locale, { style: 'currency', currency })
)

export const dateFormatter = ({ locale = 'en-CA' }) => (
  new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' })
)
