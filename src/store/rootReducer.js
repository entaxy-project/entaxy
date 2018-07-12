import { combineReducers } from 'redux'
import userReducer from './user/reducer'
import transactionsReducer from './transactions/reducer'

export default combineReducers({
  user: userReducer,
  transactions: transactionsReducer
})
