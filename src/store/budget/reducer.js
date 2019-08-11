/* eslint-disable no-case-declarations */
import uuid from 'uuid/v4'
import types from './types'
import budgetCategories from '../../data/budgetCategories'

// https://projects.susielu.com
// http://repec.sowi.unibe.ch/stata/palettes/index.html
export const defaultColours = [
  '#1f78b4', '#b2df8a', '#e31a1c',
  '#ff7f00', '#cab2d6', '#a6cee3',
  '#33a02c', '#6a3d9a', '#fb9a99',
  '#fdbf6f', '#ffff99', '#b15928'
]


export const generateCategoryTree = (categoriesById) => {
  const parents = Object.values(categoriesById).reduce((result, parentCategory) => {
    if (!('parentId' in parentCategory)) {
      return {
        ...result,
        [parentCategory.id]: {
          id: parentCategory.id,
          label: parentCategory.name,
          isIncome: parentCategory.isIncome,
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
    .sort((a, b) => ((a.label.toLowerCase() > b.label.toLowerCase()) ? 1 : -1))
}

const generateInitialState = () => {
  let count = 0
  const categoriesById = Object.keys(budgetCategories).reduce((result, groupName) => {
    const groupId = uuid()
    const group = {
      id: groupId,
      name: groupName,
      isIncome: groupName === 'Income'
    }
    const categories = budgetCategories[groupName].reduce((res, categoryName) => {
      const category = {
        id: uuid(),
        parentId: groupId,
        name: categoryName,
        colour: defaultColours[count % defaultColours.length]
      }
      count += 1
      return { ...res, [category.id]: category }
    }, {})

    return {
      ...result,
      [group.id]: group,
      ...categories
    }
  }, {})

  return {
    categoriesById,
    categoryTree: generateCategoryTree(categoriesById),
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
      let colour = null
      if ('parentId' in payload) {
        // Select the next colour of the category
        const group = state.categoryTree.find((cat => cat.id === payload.parentId))
        const lastColour = group.options.length === 0
          ? defaultColours[defaultColours.length - 1]
          : group.options[group.options.length - 1].colour
        const lastColourIndex = defaultColours.indexOf(lastColour)
        colour = defaultColours[(lastColourIndex + 1) % defaultColours.length]
      }
      categoriesById = {
        ...state.categoriesById,
        [payload.id]: {
          ...payload,
          ...(colour !== null ? { colour } : {})
        }
      }
      return {
        ...state,
        categoriesById,
        categoryTree: generateCategoryTree(categoriesById)
      }
    case types.UPDATE_CATEGORY:
      categoriesById = { ...state.categoriesById, [payload.id]: payload }
      return {
        ...state,
        categoriesById,
        categoryTree: generateCategoryTree(categoriesById)
      }
    case types.DELETE_CATEGORY:
      // Remove the selected category
      const { [payload]: category, ...rest } = state.categoriesById
      // Delete all the sub categories (if they exist)
      categoriesById = Object.values(rest).reduce((res, child) => {
        if (child.parentId === category.id) {
          return res
        }
        return { ...res, [child.id]: child }
      }, {})
      // Delete all related rules
      const rules = Object.keys(state.rules).reduce((res, match) => {
        if (state.rules[match].categoryId in categoriesById) {
          return { ...res, [match]: state.rules[match] }
        }
        return res
      }, {})
      return {
        ...state,
        categoriesById,
        categoryTree: generateCategoryTree(categoriesById),
        rules
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
