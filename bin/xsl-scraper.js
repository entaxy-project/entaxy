/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
const xlsx = require('xlsx')
const fs = require('fs')
const path = require('path')

const DOCUMENT_ROOT = path.resolve(process.cwd(), 'downloads')

// Set this to null to parse all documents
// Set this to a filename to parse only that document
const PARSE_SINGLE_DOCUMENT = null
// const PARSE_SINGLE_DOCUMENT = 'CDSP-AWES3N_T5013_R15_TY2018_2018_02_28_15_31_24.xls'
const PARSE_ONLY_DOCUMENT_TYPE = 'T3'

// eslint-disable-next-line camelcase
const parse_T3 = (ws) => {
  console.log('parse_T3')
  // console.log(ws)
  const distributionColumns = Array.from({ length: 14 }, (_, i) => String.fromCharCode('D'.charCodeAt(0) + i))
  let count = 0
  let column = distributionColumns[count]
  const distributions = []
  while (ws[`${column}19`]) {
    distributions.push({
      totalAmountPerUnit: ws[`${column}19`].v,
      paymentDate: ws[`${column}21`].v,
      capitalGains: ws[`${column}25`] ? ws[`${column}25`].v : undefined,
      amountOfEligibleDividends: ws[`${column}26`] ? ws[`${column}26`].v : undefined,
      amountOfNonEligibleDividends: ws[`${column}27`] ? ws[`${column}27`].v : undefined,
      foreignBusinessIncome: ws[`${column}28`] ? ws[`${column}28`].v : undefined,
      foreignNonBusinessIncome: ws[`${column}29`] ? ws[`${column}29`].v : undefined,
      otherInvestmentIncome: ws[`${column}30`] ? ws[`${column}30`].v : undefined,
      returnOfCapital: ws[`${column}32`] ? ws[`${column}32`].v : undefined
    })
    count++
    column = distributionColumns[count]
  }

  return {
    year: ws.A2.v,
    name: ws.C5.v,
    symbol: ws.M5.v,
    website: ws.M6 ? ws.M6.v : undefined,
    calculationMethod: ws.G15.v === 1 ? 'RATE' : 'PER CENT',
    distributions
  }
}

// eslint-disable-next-line camelcase
const parse_T5013_R5 = (ws) => {
  console.log('parse_T5013_R5')
  const distributionColumns = Array.from({ length: 14 }, (_, i) => String.fromCharCode('E'.charCodeAt(0) + i))
  let count = 0
  let column = distributionColumns[count]
  const distributions = []
  while (ws[`${column}21`]) {
    distributions.push({
      paymentDate: ws[`${column}21`].v,

      returnOfCapital: ws[`${column}42`] ? ws[`${column}42`].v : undefined

    })
    count++
    column = distributionColumns[count]
  }
  return {
    year: ws.A2.v,
    name: ws.C7.v,
    website: ws.M13 ? ws.M13.v : undefined,
    calculationMethod: ws.P5.v === 1 ? 'YEAR-END POSITION' : 'DISTRIBUTION',
    distributions
  }
}

// eslint-disable-next-line camelcase
const parse_T5 = (ws) => {
  console.log('parse_T5')

  // console.log(ws['!objects'])
  return {
    year: 1
  }
}

// eslint-disable-next-line camelcase
const parse_T3_French = (ws) => {
  console.log('parse_T3_French')
  return {
    year: ws.A2.v,
    name: ws.C5.v,
    symbol: ws.M5.v,
    website: ws.M6 ? ws.M6.v : undefined,
    calculationMethod: ws.G15.v === 1 ? 'RATE' : 'PER CENT'
  }
}

const parseXlsDocument = (folder, filename) => {
  const wb = xlsx.readFile(`${folder}/${filename}`)
  const ws = wb.Sheets[wb.SheetNames[0]]
  let parsingFunction
  switch (ws.A1.v) {
    case 'T5013/R15 Form':
      if (PARSE_ONLY_DOCUMENT_TYPE && PARSE_ONLY_DOCUMENT_TYPE === 'T5013') {
        parsingFunction = parse_T5013_R5
      }
      break
    case 'Statement of Split Shares Income Allocations and Designations':
      if (PARSE_ONLY_DOCUMENT_TYPE && PARSE_ONLY_DOCUMENT_TYPE === 'T5') {
        parsingFunction = parse_T5
      }
      break
    case 'Statement of Trust Income Allocations and Designations':
    case 'ETAT DES REVENUS DE FIDUCIE (REPARTITION ET ALLOCATION)':
      if (PARSE_ONLY_DOCUMENT_TYPE && PARSE_ONLY_DOCUMENT_TYPE === 'T3') {
        parsingFunction = parse_T3
      }
      break
    default:
      console.log('Unknown xsl document type')
      console.log(ws.A1)
      process.exit()
  }

  if (parsingFunction) {
    console.log('Parsing: ', filename)
    const data = parsingFunction(ws)
    console.log(data)
    if (!data.name) {
      console.log('ERROR: unexpected data')
      process.exit()
    }
  }
}

if (PARSE_SINGLE_DOCUMENT) {
  parseXlsDocument(DOCUMENT_ROOT, PARSE_SINGLE_DOCUMENT)
} else {
  fs.readdir(DOCUMENT_ROOT, (err, list) => {
    if (err) throw err
    list.forEach((filename) => {
      if (path.extname(filename) === '.xls') {
        parseXlsDocument(DOCUMENT_ROOT, filename)
      }
    })
  })
}
