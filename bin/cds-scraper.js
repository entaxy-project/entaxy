/* eslint-disable array-callback-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-plusplus */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
/* eslint-disable prefer-template */
const fs = require('fs')
// eslint-disable-next-line import/no-unresolved
const casper = require('casper').create({
  pageSettings: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:23.0) Gecko/20130404 Firefox/23.0'
  },
  verbose: false,
  logLevel: 'debug'
})

// https://www.methodsandtools.com/tools/casperjs.php
const baseUrl = 'https://services.cds.ca/applications/taxforms/taxforms.nsf'
const url = baseUrl + '/PROCESSED-EN-'
const params = 'OpenView&Start=1&Count=3000&RestrictToCategory=All-2018'

casper.start(url + '?' + params, function () {
  this.echo('Clicking I accept link')
  this.clickLabel('I accept', 'a')
})

casper.then(function () {
  const tableId = '#taxlist'
  this.echo('Loading table data ...')
  if (this.exists(tableId)) {
    this.echo('Found ' + tableId + ' table', 'INFO')
  } else {
    this.echo(tableId + ' not found', 'ERROR')
  }

  const data = this.evaluate(function () {
    const tableRows = document.querySelectorAll('#taxlist > tbody > tr')
    return Array.prototype.map.call(tableRows, function (row) {
      return {
        date: row.querySelector('td:nth-child(1) span.Date').textContent,
        // company: row.querySelector('td:nth-child(4) a').textContent,
        docType: row.querySelector('td:nth-child(5) span.Type').textContent,
        docUrl: row.querySelector('td:nth-child(6) a').href
      }
    })
  })
  fs.write('downloads/data.js', JSON.stringify(data), 'w')

  data.map(function (d, index) {
    console.log(index + 1 + '/' + data.length)
    const docUrl = data[index].docUrl
    const filename = docUrl.substr(docUrl.lastIndexOf('/') + 1)
    casper.download(docUrl, 'downloads/' + filename)
  })
})

casper.options.onResourceRequested = function (_casper, requestData) {
  console.log('[LOAD]', requestData.url)
}

casper.run(function () {
  this.echo('Done')
  this.exit()
})
