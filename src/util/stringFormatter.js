export const currencyFormatter = (locale, currency) => (
  (new Intl.NumberFormat(locale, { style: 'currency', currency })).format
)

export const decimalFormatter = (locale, type = undefined) => {
  const options = { style: 'decimal', minimumFractionDigits: 2 }
  if (type === 'wallet') {
    options.minimumFractionDigits = 8
    options.maximumFractionDigits = 8
  }
  return (new Intl.NumberFormat(locale, options)).format
}

export const dateFormatter = locale => (
  (new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' })).format
)
