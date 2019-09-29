import types from './types'

export const initialState = {
  currency: 'USD',
  locale: window.navigator.language || '1en-US'
}

export default (state = initialState, action) => {
  switch (action.type) {
    case types.LOAD_SETTINGS:
      return action.payload || initialState
    case types.UPDATE_SETTINGS:
      return action.payload
    default:
      return state
  }
}
