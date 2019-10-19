export const institutions = {
  crypto: {
    Coinbase: {
      name: 'Coinbase',
      importTypes: [],
      url: 'https://www.coinbase.com',
      favicon: 'https://www.coinbase.com/favicon.ico'
    },
    Binance: {
      name: 'Binance',
      importTypes: [],
      url: 'https://www.binance.com',
      favicon: 'https://bin.bnbstatic.com/static/images/common/favicon.ico'
    },
    Kraken: {
      name: 'Kraken',
      importTypes: [],
      url: 'https://www.kraken.com',
      favicon: 'https://www.kraken.com/img/favicon.ico?v=2'
    }
  },
  fiat: {
    'TD EasyWeb': {
      name: 'TD EasyWeb',
      importTypes: [],
      url: 'https://www.td.com',
      favicon: 'https://www.td.com/ca/en/personal-banking/system/v1.5/assets/img/favicon.ico'
    },
    'Bank of Montreal': {
      name: 'Bank of Montreal',
      importTypes: [],
      url: 'https://www12.bmo.com',
      favicon: 'https://www12.bmo.com/onlinebanking/onlinebanking/en/images/favicon.ico'
    },
    'PC Financial': {
      name: 'PC Financial',
      importTypes: [],
      url: 'https://www.pcfinancial.ca',
      favicon: 'https://www.pcfinancial.ca/assets/media/img/favicon.ico'
    },
    Tangerine: {
      name: 'Tangerine',
      importTypes: [],
      url: 'https://www.tangerine.ca',
      favicon: 'https://www.tangerine.ca/favicon.ico  '
    },
    'Royal Bank': {
      name: 'Royal Bank',
      importTypes: [],
      url: 'https://www.rbcroyalbank.com',
      favicon: 'https://www.rbcroyalbank.com/uos/_assets/images/icons/favicon.ico'
    },
    Questrade: {
      name: 'Questrade',
      importTypes: [],
      url: 'https://www.questrade.com',
      favicon: 'https://www.questrade.com/Resources/images/favicon.ico'
    }
  }
}

export const sortedInstitutionsOfType = (type) => (
  Object.keys(institutions[type])
    .sort((a, b) => (a > b))
    .reduce((result, i) => ({
      ...result,
      [i]: institutions[type][i]
    }), {})
)
