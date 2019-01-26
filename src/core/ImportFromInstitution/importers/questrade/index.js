/* eslint-disable no-console */
const _ = require('lodash')
// const fs = require('fs')
// const path = require('path')
// const crypto = require('crypto')
// const uuidV4 = require('uuid/v4')
// const moment = require('moment')

// curl -H "Origin: http://example.com" --verbose /
// "https://login.questrade.com/oauth2/token?grant_type=refresh_token&refresh_token=-N8_cyts4oHt-btZlIgdbM3WpJIAvyLl0"
const redeemToken = async (refreshToken) => {
  const url = 'https://login.questrade.com/oauth2/token'
  console.log('refreshToken', refreshToken)
  if (_.isNil(refreshToken)) {
    throw new Error()
  }
  const res = await fetch(`${url}?grant_type=refresh_token&refresh_token=${refreshToken}`, {
    method: 'POST',
    body: `grant_type=refresh_token&refresh_token=${refreshToken}`
  })
  console.log('res', res)
  return res.json()
}

const getAccounts = (host, accessToken) => {
  return fetch(`${host}v1/accounts`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
    .then(res => res.json())
}


// const getActivitiesForDateRanges = (host, accessToken, accountId, startTime, endTime) => {
//   const url = `${host}v1/accounts/${accountId}/activities?startTime=${startTime}&endTime=${endTime}`
//   console.log(url)
//   return fetch(url, {
//     headers: {
//       Authorization: `Bearer ${accessToken}`
//     }
//   })
//     .then(res => res.json())
// }


// const getActivities = (host, accessToken, accountId) => {
//   // Get 4 years worth of activities
//   const monthsOfDataToFetch = 1 * 12
//   let endOfPeriod = moment().endOf('day')

//   const periods = []
//   _.times(monthsOfDataToFetch, () => {
//     // Maximum 31 days of data can be requested at a time.
//     const startOfPeriod = endOfPeriod.clone().subtract(30, 'day')
//     periods.push({
//       startOfPeriod,
//       endOfPeriod
//     })
//     endOfPeriod = startOfPeriod
//   })

//   return Promise
//     .map(periods, (period) => {
//       return getActivitiesForDateRanges(
//         host,
//         accessToken,
//         accountId,
//         period.startOfPeriod.toISOString(),
//         period.endOfPeriod.toISOString()
//       )
// //         .delay(50)
//     }, { concurrency: 1 })
//     .then(data => Promise.resolve(_.flatten(_.map(data, 'activities'))))
// }

// const normalizeTransactions = (account, transactionData) => {
//   console.log('transactionData: ', transactionData)
//   _.reduce(transactionData, (result, activity) => {
//     if (activity.type !== 'Trades') {
//       return result
//     }
//     result.push({
//       id: uuidV4(),
//       source: 'questrade',
//       accountType: account.type,
//       date: activity.tradeDate,
//       type: activity.action.toLowerCase(),
//       description: _.trim(activity.description),
//       units: Math.abs(activity.quantity),
//       symbol: activity.symbol,
//       fiatAmount: Math.abs(activity.grossAmount),
//       fiatCurrency: activity.currency,
//       pricePerUnit: activity.price
//     })
//     return result
//   }, [])
// }

// var config = { access_token: 'ojEb50OxZQLV1KEVM2FGsmWbAN-eDTN70',
//   api_server: 'https://api03.iq.questrade.com/',
//   expires_in: 1800,
//   refresh_token: '_3uQ9FmSxGllfcLlOrEg3ORBEshWAAzu0',
//   token_type: 'Bearer' }


const importData = ({ refreshToken }) => {
  return redeemToken(refreshToken)
    .then((tokenData) => {
      console.log('tokenData', tokenData)
      const newRefreshToken = tokenData.refresh_token // For next time we access the API
      const host = tokenData.api_server
      const accessToken = tokenData.access_token

      return getAccounts(host, accessToken)
        .then((accountData) => {
          console.log('accountData', accountData)
          return Promise.map(accountData.accounts, (account) => {
            // const accountNumber = account.number
            console.log('account', account)
            // return getActivities(host, accessToken, accountNumber)
            //   .then(activities =>
            //     Promise.resolve({
            //       newRefreshToken,
            //       transactions: normalizeTransactions(account, activities)
            //     }))

            return {
              accountGroup: { refreshToken: newRefreshToken },
              accounts: []
            }
          })
        })
    })
    .catch((err) => {
      console.warn('Error happened:')
      console.warn('Maybe try with a new token from the API dashboard?')
      console.warn(err)
    })
}

export default importData
