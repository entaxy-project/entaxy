const institutions = {
  TD: {
    description: 'TD EasyWeb',
    importTypes: ['CSV'],
    url: 'https://www.td.com',
    favicon: 'https://www.td.com/ca/en/personal-banking/system/v1.5/assets/img/favicon.ico'
  },
  BMO: {
    description: '',
    importTypes: ['CSV'],
    url: 'https://www12.bmo.com',
    favicon: 'https://www12.bmo.com/onlinebanking/onlinebanking/en/images/favicon.ico'
  },
  PCFinancial: {
    description: '',
    importTypes: ['CSV'],
    url: 'https://www.pcfinancial.ca',
    favicon: 'https://www.pcfinancial.ca/assets/media/img/favicon.ico'
  },
  Tangerine: {
    description: '',
    importTypes: ['CSV'],
    url: 'https://www.tangerine.ca',
    favicon: 'https://www.tangerine.ca/favicon.ico  '
  },
  RBC: {
    description: '',
    importTypes: ['CSV'],
    url: 'https://www.rbcroyalbank.com',
    favicon: 'https://www.rbcroyalbank.com/uos/_assets/images/icons/favicon.ico'
  },
  Questrade: {
    description: '',
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
