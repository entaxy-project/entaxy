/* eslint-disable no-case-declarations */
import uuid from 'uuid/v4'
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


const categoryTree = (categoriesById) => {
  const parents = Object.values(categoriesById).reduce((result, parentCategory) => {
    if (!('parentId' in parentCategory)) {
      return {
        ...result,
        [parentCategory.id]: {
          id: parentCategory.id,
          label: parentCategory.name,
          options: []
        }
      }
    }
    return result
  }, {})
  Object.values(categoriesById).forEach((category) => {
    if (category.parentId in parents) {
      parents[category.parentId].options.push({
        id: category.id,
        label: category.name,
        value: category.name,
        colour: category.colour
      })
    }
  })
  return Object.values(parents)
}

const generateInitialState = () => {
  let count = 0
  const categoriesById = Object.keys(budgetCategories).reduce((result, category) => {
    const parentId = uuid()
    const parent = {
      id: parentId,
      name: category
    }
    const children = budgetCategories[category].reduce((res, subCategory) => {
      const child = {
        id: uuid(),
        parentId,
        name: subCategory,
        colour: defaultColours[count % defaultColours.length]
      }
      count += 1
      return { ...res, [child.id]: child }
    }, {})

    return {
      ...result,
      [parent.id]: parent,
      ...children
    }
  }, {})

  return {
    categoriesById,
    categoryTree: categoryTree(categoriesById),
    rules: {} // rules have the format => match: { category: 'cat 1', type: 'exact_match', count: 0 }
  }
}
export const initialState = generateInitialState()
let categoriesById

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case types.LOAD_BUDGET:
      return payload || initialState
    case types.CREATE_CATEGORY:
      const topCategory = state.categoryTree.find((cat => cat.id === payload.category.parentId))
      const lastColour = topCategory.options[topCategory.options.length - 1].colour
      const lastColourIndex = defaultColours.indexOf(lastColour)
      categoriesById = {
        ...state.categoriesById,
        [payload.category.id]: {
          ...payload.category,
          colour: defaultColours[(lastColourIndex + 1) % defaultColours.length]
        }
      }
      return {
        ...state,
        categoriesById,
        categoryTree: categoryTree(categoriesById)
      }
    case types.UPDATE_CATEGORY:
      categoriesById = { ...state.categoriesById, [payload.id]: payload }
      return {
        ...state,
        categoriesById,
        categoryTree: categoryTree(categoriesById)
      }
    case types.DELETE_CATEGORY:
      const { [payload]: category, ...rest } = state.categoriesById
      return {
        ...state,
        categoriesById: rest,
        categoryTree: categoryTree(rest)
      }
    case types.CREATE_EXACT_RULE:
      return {
        ...state,
        rules: {
          ...state.rules,
          [payload.match]: {
            categoryId: payload.categoryId,
            type: 'exact_match',
            count: 0
          }
        }
      }
    case types.DELETE_EXACT_RULE:
      const r = Object.keys(state.rules).reduce((result, match) => {
        if (match !== payload) {
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
      for (const transaction of payload) {
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
