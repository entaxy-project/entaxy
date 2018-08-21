import { combineReducers } from 'redux'
import userReducer from './user/reducer'
import settingsReducer from './settings/reducer'
import transactionsReducer from './transactions/reducer'
import marketValuesReducer from './marketValues/reducer'

export default combineReducers({
  user: userReducer,
  settings: settingsReducer,
  transactions: transactionsReducer,
  marketValues: marketValuesReducer
})
