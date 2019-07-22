import { combineReducers } from 'redux'
import userReducer from './user/reducer'
import settingsReducer from './settings/reducer'
import accountsReducer from './accounts/reducer'
import transactionsReducer from './transactions/reducer'
import exchangeRatesReducer from './exchangeRates/reducer'
import budgetReducer from './budget/reducer'

export default combineReducers({
  user: userReducer,
  settings: settingsReducer,
  accounts: accountsReducer,
  transactions: transactionsReducer,
  exchangeRates: exchangeRatesReducer,
  budget: budgetReducer
})
