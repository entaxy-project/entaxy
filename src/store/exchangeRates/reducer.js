import { omit } from 'lodash'
import parse from 'date-fns/parse'
import types from './types'

export const initialState = {}

export default (state = initialState, action) => {
  switch (action.type) {
    case types.LOAD_EXCHANGE_RATES:
      return action.payload || initialState
    case types.UPDATE_EXCHANGE_RATES:
      // payload = {
      //   '2019-01-01': { GBP: 1.4, CAD: 1.0 },
      //   '2019-02-02': { GBP: 1.3}
      // }
      // eslint-disable-next-line no-case-declarations
      const newState = Object.keys(action.payload)
        .reduce((res1, date) => {
          return Object.keys(action.payload[date])
            .reduce((res2, currency) => ({
              ...res2,
              [currency]: {
                ...res2[currency],
                [parse(date, 'yyyy-M-d', new Date()).getTime()]: action.payload[date][currency]
              }
            }), res1)
        }, state)
      return newState
    case types.DELETE_CURRENCIES:
      return omit(state, action.payload)
    default:
      return state
  }
}
