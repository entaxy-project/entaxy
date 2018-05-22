import { initialState as userInitialState } from '../user/reducer'
import store from '../'

describe('store', () => {
  it('gets created', () => {
    expect(store.getState()).toEqual({ user: userInitialState })
  })
})
