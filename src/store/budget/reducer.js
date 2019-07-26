import types from './types'
import budgetCategories from '../../data/budgetCategories'

// https://projects.susielu.com
// http://repec.sowi.unibe.ch/stata/palettes/index.html
const defaultColours = [
  '#1f78b4', '#b2df8a', '#e31a1c',
  '#ff7f00', '#cab2d6', '#a6cee3',
  '#33a02c', '#6a3d9a', '#fb9a99',
  '#fdbf6f', '#ffff99', '#b15928'
]

export const initialState = (() => {
  const colours = {}
  let count = 0
  const categories = Object.keys(budgetCategories).sort().map(category => (
    {
      label: category,
      options: budgetCategories[category].map((subCategory) => {
        const colour = defaultColours[count % defaultColours.length]
        colours[subCategory] = colour
        count += 1
        return { label: subCategory, value: subCategory, colour }
      })
    }
  ))
  return {
    categories,
    colours,
    rules: {} // rules have the format => match: { category: 'cat 1', type: 'exact_match', count: 0 }
  }
})()

export default (state = initialState, action) => {
  switch (action.type) {
    case types.LOAD_BUDGET:
      return action.payload || initialState
    case types.CREATE_EXACT_RULE:
      return {
        ...state,
        rules: {
          ...state.rules,
          [action.payload.match]: {
            category: action.payload.category,
            type: 'exact_match',
            count: 0
          }
        }
      }
    case types.DELETE_EXACT_RULE:
      // eslint-disable-next-line no-case-declarations
      const r = Object.keys(state.rules).reduce((result, match) => {
        if (match !== action.payload) {
          return {
            ...result,
            rules: { ...result.rules, [match]: state.rules[match] }
          }
        }
        return result
      }, { ...state, rules: {} })
      return r
    case types.COUNT_RULE_USAGE:
      // reset counters
      // eslint-disable-next-line no-case-declarations
      const newState = Object.keys(state.rules).reduce((result, match) => (
        {
          ...result,
          rules: {
            ...result.rules,
            [match]: { ...result.rules[match], count: 0 }
          }
        }
      ), state)

      // count the transactions
      for (const transaction of action.payload) {
        if (transaction.description in newState.rules) {
          newState.rules[transaction.description].count += 1
        }
      }
      // remove unused rules
      return Object.keys(newState.rules).reduce((result, match) => {
        if (newState.rules[match].count > 0) {
          return {
            ...result,
            rules: { ...result.rules, [match]: newState.rules[match] }
          }
        }
        return result
      }, { ...newState, rules: {} })
    default:
      return state
  }
}
