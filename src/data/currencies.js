export const fiatCurrencies = {
  EUR: 'Euro',
  USD: 'US dollar',
  JPY: 'Japanese Yen',
  BGN: 'Bulgarian Lev',
  CZK: 'Czech Koruna',
  DKK: 'Danish Krone',
  GBP: 'British Pound',
  HUF: 'Hungarian Forint',
  PLN: 'Polish Zloty',
  RON: 'Romanian Leu',
  SEK: 'Swedish Krona',
  CHF: 'Swiss Franc',
  ISK: 'Icelandic Kr\u00f3na',
  NOK: 'Norwegian Krone',
  HRK: 'Croatian Kuna',
  RUB: 'Russian Ruble',
  TRY: 'Turkish Lira',
  AUD: 'Australian Dollar',
  BRL: 'Brazilian Real',
  CAD: 'Canadian Dollar',
  CNY: 'Chinese Yuan',
  HKD: 'Hong Kong Dollar',
  IDR: 'Indonesian Rupiah',
  ILS: 'Israeli New Shekel',
  INR: 'Indian Rupee',
  KRW: 'South Korean Won',
  MXN: 'Mexican Peso',
  MYR: 'Malaysian Ringgit',
  NZD: 'New Zealand Dollar',
  PHP: 'Philippine Peso',
  SGD: 'Singapore Dollar',
  THB: 'Thai Baht',
  ZAR: 'South African Rand'
}

export const cryptoCurrencies = {
  BTN: 'Bitcoin',
  BCH: 'Bitcoin Cash',
  LTC: 'Litecoin',
  ETH: 'Ethereum'
}

export const formatedFiatCurrencies = Object.keys(fiatCurrencies)
  .sort()
  .map(key => ({
    value: key,
    label: `(${key}) ${fiatCurrencies[key]}`
  }))

export const filteredFiatCurrencies = (inputValue) => {
  return new Promise((resolve) => {
    if (inputValue) {
      resolve(formatedFiatCurrencies.filter(
        currency => currency.label.toLowerCase().includes(inputValue.toLowerCase())
      ))
    }
    resolve(formatedFiatCurrencies)
  })
}
