import { combineReducers } from 'redux'
import userReducer from './user/reducer'
import transactionsReducer from './transactions/reducer'
import marketValuesReducer from './marketValues/reducer'

export default combineReducers({
  user: userReducer,
  transactions: transactionsReducer,
  marketValues: marketValuesReducer
})
