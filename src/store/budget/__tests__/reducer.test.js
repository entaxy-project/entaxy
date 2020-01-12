import budgetReducer, { initialState, colorScale, generateCategoryTree } from '../reducer'
import types from '../types'
import budgetCategories from '../../../data/budgetCategories'

const rule = {
  id: 'r1',
  accountId: 'a1',
  attributes: { categoryId: 'c1' },
  filterBy: { description: { type: 'equals', value: 'some description' } }
}

describe('budget reducer', () => {
  const budget = {
    ...initialState,
    rules: {
      'Shoppint Mart': 'Groceries'
    }
  }
  describe('initialState', () => {
    it('should return initial state', () => {
      const categoriesCount = Object.values(budgetCategories).reduce((count, group) => count + group.length + 1, 0)
      expect(budgetReducer(undefined, {})).toEqual(initialState)
      expect(Object.keys(initialState.categoriesById).length).toBe(categoriesCount)
      const groupsCount = Object.values(initialState.categoriesById).reduce(
        (res, cat) => ('parentId' in cat ? res : res + 1),
        0
      )
      expect(Object.keys(initialState.categoryTree).length).toBe(groupsCount)
    })
  })

  describe('LOAD_BUDGET', () => {
    it('should handle LOAD_BUDGET', () => {
      const type = types.LOAD_BUDGET
      const payload = budget
      expect(budgetReducer(undefined, { type, payload })).toEqual(payload)
    })

    it('should handle LOAD_BUDGET with no existing data', () => {
      const type = types.LOAD_BUDGET
      const payload = null
      expect(budgetReducer(undefined, { type, payload })).toEqual(initialState)
    })
  })

  describe('CREATE_CATEGORY', () => {
    it('should create a group', () => {
      const type = types.CREATE_CATEGORY
      const payload = { id: 1, name: 'cat 1' }
      expect(budgetReducer(undefined, { type, payload })).toEqual({
        ...initialState,
        categoriesById: {
          ...initialState.categoriesById,
          [payload.id]: payload
        },
        categoryTree: [
          ...initialState.categoryTree,
          { id: payload.id, label: payload.name, options: [] }
        ].sort((a, b) => ((a.label.toLowerCase() > b.label.toLowerCase()) ? 1 : -1))
      })
    })

    it('should create a category in group with no categories', () => {
      const type = types.CREATE_CATEGORY
      const group = { id: 1, name: 'group 1' }
      const simpleInitialState = {
        categoriesById: { 1: group },
        categoryTree: generateCategoryTree({ 1: group })
      }
      const payload = { id: 1, name: 'cat 1', parentId: group.id }
      const categoriesById = {
        1: group,
        [payload.id]: { ...payload, colour: colorScale(0) }
      }
      expect(budgetReducer(simpleInitialState, { type, payload })).toEqual({
        categoriesById,
        categoryTree: generateCategoryTree(categoriesById)
      })
    })

    it('should create a category in group with other categories', () => {
      const type = types.CREATE_CATEGORY

      const group = initialState.categoryTree[0]
      expect(group.label).toBe(Object.keys(budgetCategories).sort()[0])
      expect(group.options.length).toBeGreaterThan(0)
      const payload = { id: 1, name: 'cat 1', parentId: group.id }
      const categoriesById = {
        ...initialState.categoriesById,
        [payload.id]: {
          ...payload,
          colour: colorScale(group.options.length)
        }
      }
      expect(budgetReducer(undefined, { type, payload })).toEqual({
        ...initialState,
        categoriesById,
        categoryTree: generateCategoryTree(categoriesById)
      })
    })
  })

  describe('UPDATE_CATEGORY', () => {
    it('should update a category', () => {
      const type = types.UPDATE_CATEGORY
      const category = initialState[0]
      const payload = { ...category, name: 'cat 1' }
      expect(budgetReducer(undefined, { type, payload })).toEqual({
        ...initialState,
        categoriesById: {
          ...initialState.categoriesById,
          [payload.id]: payload
        },
        categoryTree: generateCategoryTree({
          ...initialState.categoriesById,
          [payload.id]: payload
        })
      })
    })
  })

  describe('DELETE_CATEGORY', () => {
    it('should delete a group', () => {
      const type = types.DELETE_CATEGORY
      const categoriesById = {
        1: { id: 1, name: 'group 1' },
        2: { id: 2, name: 'group 2 ' },
        3: { id: 3, name: 'cat 1', parentId: 1 },
        4: { id: 4, name: 'cat 1', parentId: 2 }
      }
      const state = {
        categoriesById,
        categoryTree: generateCategoryTree(categoriesById),
        rules: {
          a: { categoryId: 1 },
          b: { categoryId: 2 }
        }
      }

      expect(budgetReducer(state, { type, payload: 1 })).toEqual({
        ...state,
        categoriesById: {
          2: { id: 2, name: 'group 2 ' },
          4: { id: 4, name: 'cat 1', parentId: 2 }
        },
        categoryTree: generateCategoryTree({
          2: { id: 2, name: 'group 2 ' },
          4: { id: 4, name: 'cat 1', parentId: 2 }
        }),
        rules: { b: { categoryId: 2 } }
      })
    })

    it('should delete a category', () => {
      const type = types.DELETE_CATEGORY
      const categoryId = initialState.categoryTree[0].options[0].id
      expect(initialState.categoriesById[categoryId].parentId === undefined)

      const { [categoryId]: _, ...rest } = initialState.categoriesById
      expect(budgetReducer(undefined, { type, payload: categoryId })).toEqual({
        ...initialState,
        categoriesById: rest,
        categoryTree: generateCategoryTree(rest)
      })
    })
  })

  describe('Rules', () => {
    it('should create a new rule', () => {
      const type = types.CREATE_RULE
      const payload = rule
      expect(budgetReducer(initialState, { type, payload })).toEqual({
        ...initialState,
        rules: { [payload.id]: payload }
      })
    })

    it('should update an existing rule', () => {
      const type = types.UPDATE_RULE
      const payload = rule
      const state = { ...initialState, rules: { [rule.id]: { } } }
      expect(budgetReducer(state, { type, payload })).toEqual({
        ...initialState,
        rules: { [payload.id]: payload }
      })
    })

    it('should delete a new rule', () => {
      const type = types.DELETE_RULE
      const state = {
        rules: {
          abc: {
            id: 'abc',
            accountId: '123',
            attributes: { categoryId: '456' },
            filterBy: { description: { type: 'equals', value: 'lorem ipsum' } }
          },
          [rule.id]: rule
        }
      }
      expect(budgetReducer(state, { type, payload: rule.id })).toEqual({
        rules: {
          abc: {
            id: 'abc',
            accountId: '123',
            attributes: { categoryId: '456' },
            filterBy: { description: { type: 'equals', value: 'lorem ipsum' } }
          }
        }
      })
    })
  })
})
