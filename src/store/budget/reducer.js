/* eslint-disable no-case-declarations */
import uuid from 'uuid/v4'
import * as d3 from 'd3'
import types from './types'
import budgetCategories from '../../data/budgetCategories'

export const colorScale = d3.scaleOrdinal(d3.schemeSet3)

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
        colour: colorScale(count)
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
    rules: {}
  }
}

// Rules are indexed by id and have the following format:
// {
//   'abc': {
//     id: 'abc',
//     accountId: 'xyz',
//     filterBy: {
//       description: {type: 'equals|starts_with|ends_with|contains', value: '...'},
//       amount: {type: 'equals', value: '...'},
//     },
//     attributes: {
//       categoryId: 'abc123',
//       transfer: {
//         direction: 'from|to'
//         accountId: 'abc'
//       }
//     }
//   },
//   ...
// }

export const initialState = generateInitialState()
let categoriesById

export const RULE_TYPES = {
  equals: 'match',
  start_with: 'start with',
  end_with: 'end with',
  contain: 'contain'
}

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case types.LOAD_BUDGET:
      return payload || initialState
    case types.CREATE_CATEGORY:
      let colour = null
      if ('parentId' in payload) {
        // Select the next colour of the category
        const group = state.categoryTree.find(((cat) => cat.id === payload.parentId))
        colour = colorScale(group.options.length)
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
    case types.CREATE_RULE:
      return {
        ...state,
        rules: {
          ...state.rules,
          [payload.id]: payload
        }
      }
    case types.UPDATE_RULE:
      return {
        ...state,
        rules: {
          ...state.rules,
          [payload.id]: payload
        }
      }
    case types.DELETE_RULE:
      const { [payload]: _, ...newRules } = state.rules
      return { ...state, rules: newRules }
    default:
      return state
  }
}
