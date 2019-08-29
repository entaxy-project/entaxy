/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
import crypto from 'crypto'
import queryString from 'query-string'
import Big from 'big.js'
import parseISO from 'date-fns/parseISO'

const baseUrl = 'https://api.coinbase.com'
const apiVersion = 'v2'
const apiVersionDate = '2015-07-22'

const getSignature = (apiSecret, resource, timestamp) => {
  // Set the parameter for the request message
  const req = { method: 'GET', path: `/${apiVersion}/${resource}`, body: '' }

  // Create a hexedecimal encoded SHA256 signature of the message
  const message = timestamp + req.method + req.path + req.body
  return crypto.createHmac('sha256', apiSecret).update(message).digest('hex')
}

const getDataFrom = async (apiKey, apiSecret, resource, params = null) => {
  const timestamp = Math.floor(Date.now() / 1000) // Get unix time in seconds
  resource += params ? `?${queryString.stringify(params)}` : ''
  const url = `${baseUrl}/${apiVersion}/${resource}`


  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'CB-ACCESS-SIGN': getSignature(apiSecret, resource, timestamp),
      'CB-ACCESS-TIMESTAMP': timestamp,
      'CB-ACCESS-KEY': apiKey,
      'CB-VERSION': apiVersionDate
    }
  })

  if (!response.ok) {
    const message = {
      401: '401 Unauthorized. Please make sure you entered the API key correctly and that it has the right permissions'
    }[response.status]
    console.log(response)
    throw new Error(message)
  }

  return response.json()
}

export const getPaginatedDataFrom = async (apiKey, apiSecret, url, params) => {
  const response = await getDataFrom(apiKey, apiSecret, url, params)

  if (response.pagination.next_uri) {
    const pageResponse = await getPaginatedDataFrom(
      apiKey,
      apiSecret,
      response.pagination.next_uri.replace(/^\/v2\//, ''),
      null
    )
    return [...response.data, ...pageResponse]
  }
  return response.data
}

export const normalizeAccounts = (accounts) => (
  accounts.map((account) => ({
    type: 'wallet', // TODO check for other types
    sourceId: account.id,
    name: account.name,
    // currency: account.native_balance.currency,
    currency: account.currency,
    // symbol: account.currency,
    openingBalance: 0,
    openingBalanceDate: parseISO(account.created_at).getTime()
  }))
)

export const normalizeTransactions = (transactions) => (
  transactions.map((transaction) => ({
    sourceId: transaction.id,
    description: [transaction.details.title, transaction.details.subtitle].join(' - '),
    amount: parseFloat(Big(transaction.amount.amount)),
    createdAt: parseISO(transaction.created_at).getTime()
  }))
  // localCurrency: parseFloat(Big(transaction.native_amount.amount))
)

const importData = async ({ apiKey, apiSecret }) => {
  // Grab all the accounts
  // [{id: "bf999c72-b2d7-5158-a449-3aa46755f49d", name: "BCT Wallet", currency: "BCH", ...}, {...}]
  const result = await getDataFrom(apiKey, apiSecret, 'accounts')
  const accounts = normalizeAccounts(result.data)

  // Grab the transactions from each of the accounts
  await Promise.all(accounts.map(async (account) => {
    const transactions = await getPaginatedDataFrom(
      apiKey,
      apiSecret,
      `accounts/${account.sourceId}/transactions`,
      { limit: 2 }
    )

    account.transactions = normalizeTransactions(transactions)
  }))

  // Return only the accounts with transactions or the user will
  // end up with a bunch of wallets she never used
  return {
    accountGroup: { apiKey, apiSecret },
    accounts: accounts.filter((account) => account.transactions.length > 0)
  }
}

export default importData
