const institutions = {
  'TD EasyWeb': {
    importTypes: ['CSV'],
    url: 'https://www.td.com',
    favicon: 'https://www.td.com/ca/en/personal-banking/system/v1.5/assets/img/favicon.ico'
  },
  'Bank of Montreal': {
    importTypes: ['CSV'],
    url: 'https://www12.bmo.com',
    favicon: 'https://www12.bmo.com/onlinebanking/onlinebanking/en/images/favicon.ico'
  },
  'PC Financial': {
    importTypes: ['CSV'],
    url: 'https://www.pcfinancial.ca',
    favicon: 'https://www.pcfinancial.ca/assets/media/img/favicon.ico'
  },
  Tangerine: {
    importTypes: ['CSV'],
    url: 'https://www.tangerine.ca',
    favicon: 'https://www.tangerine.ca/favicon.ico  '
  },
  'Royal Bank': {
    importTypes: ['CSV'],
    url: 'https://www.rbcroyalbank.com',
    favicon: 'https://www.rbcroyalbank.com/uos/_assets/images/icons/favicon.ico'
  },
  Coinbase: {
    importTypes: ['API'],
    url: 'https://www.coinbase.com',
    favicon: 'https://www.coinbase.com/favicon.ico'
  },
  Questrade: {
    importTypes: ['CSV'],
    url: 'https://www.questrade.com',
    favicon: 'https://www.questrade.com/Resources/images/favicon.ico'
  }
}

// Sorted institutions
export default Object.keys(institutions)
  .sort((a, b) => (a > b))
  .reduce((result, i) => ({
    ...result,
    [i]: institutions[i]
  }), {})
