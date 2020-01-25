/* eslint-disable react/display-name */
/* eslint-disable react/no-multi-comp */
/* eslint-disable react/sort-comp */
import React from 'react'
import { useSelector } from 'react-redux'
import {
  Switch,
  Route,
  Redirect
} from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor } from './store'
import LoadingOverlay from './common/LoadingOverlay'
import Landing from './core/Landing'
import Taxes from './core/Taxes'
import Settings from './core/Settings'
import Dashboard from './core/Dashboard'
import Transactions from './core/Accounts/Transactions'
import NewAccount from './core/Accounts/new'
import EditAccount from './core/Accounts/edit'
import ImportTransactions from './core/Accounts/ImportTransactions'
import NewImportFromInstitution from './core/ImportFromInstitution/new'
import EditImportFromInstitution from './core/ImportFromInstitution/edit'
import BudgetCategories from './core/BudgetCategories'
import HistoryChart from './core/Budget/HistoryChart'
import MoneyFlow from './core/Budget/MoneyFlow'
import TrialBalance from './core/Budget/TrialBalance'
import Header from './common/Header'
import SnackbarMessage from './common/SnackbarMessage'
import LeftDrawer from './core/Accounts/LeftDrawer'
import HandleBlockstackLogin from './core/HandleBlockstackLogin'

export const Routes = () => {
  const {
    hasAccounts
  } = useSelector(({ accounts }) => ({
    hasAccounts: Object.keys(accounts.byId).length > 0
  }))

  const wrapComponent = (Component, options = {}) => (props) => {
    const { accountRequired, accountLeftDrawer } = options
    // Check for at least one account
    if (accountRequired && !hasAccounts) {
      return <Redirect to="/dashboard" />
    }

    if (accountLeftDrawer) {
      return (
        <Header {...props}>
          <LeftDrawer {...props}>
            <Component {...props} />
          </LeftDrawer>
        </Header>
      )
    }

    return (
      <Header {...props}>
        <Component {...props} />
      </Header>
    )
  }

  const wrappedSettings = wrapComponent(Settings)
  const wrappedBudgetCategories = wrapComponent(BudgetCategories)
  const wrappedDashBoard = wrapComponent(Dashboard)

  const wrappedNewAccount = wrapComponent(NewAccount, {
    accountLeftDrawer: true
  })

  const wrappedEditAccount = wrapComponent(EditAccount, {
    accountRequired: true,
    accountLeftDrawer: true
  })

  const wrappedTransactions = wrapComponent(Transactions, {
    accountRequired: true,
    accountLeftDrawer: true
  })

  const wrappedImportTransactions = wrapComponent(ImportTransactions, {
    accountRequired: true,
    accountLeftDrawer: true
  })

  const wrappedNewImportFromInstitution = wrapComponent(NewImportFromInstitution, {
    accountLeftDrawer: true
  })

  const wrappedEditImportFromInstitution = wrapComponent(EditImportFromInstitution, {
    accountRequired: true,
    accountLeftDrawer: true
  })

  const wrappedBudget = wrapComponent(HistoryChart)
  const wrappedMoneyFlow = wrapComponent(MoneyFlow)
  const wrappedTrialBalance = wrapComponent(TrialBalance)
  const wrappedTaxes = wrapComponent(Taxes)
  return (
    <>
      {!persistor && (
        <Switch>
          <Route exact path="/" component={Landing} />
          <Route exact path="/handle-login" component={HandleBlockstackLogin} />
          <Redirect to="/" />
        </Switch>
      )}
      {persistor && (
        <PersistGate loading={<LoadingOverlay />} persistor={persistor}>
          <Switch>
            <Route exact path="/" component={Landing} />
            <Route exact path="/taxes" component={wrappedTaxes} />
            <Route exact path="/settings" render={wrappedSettings} />
            <Route exact path="/budget-categories" render={wrappedBudgetCategories} />
            <Route exact path="/dashboard" render={wrappedDashBoard} />
            <Route exact path="/budget" render={wrappedBudget} />
            <Route exact path="/money-flow" render={wrappedMoneyFlow} />
            <Route exact path="/trial-balance" render={wrappedTrialBalance} />
            <Route exact path="/accounts/new" render={wrappedNewAccount} />
            <Route exact path="/accounts/:accountId/edit" render={wrappedEditAccount} />
            <Route exact path="/accounts/:accountId/transactions" render={wrappedTransactions} />
            <Route
              exact
              path="/accounts/:accountId/import"
              render={wrappedImportTransactions}
            />
            <Route
              exact
              path="/institutions/:institution/import/new"
              render={wrappedNewImportFromInstitution}
            />
            <Route
              exact
              path="/institutions/:institution/import/:groupId/edit"
              render={wrappedEditImportFromInstitution}
            />
            <Redirect to="/" />
          </Switch>
        </PersistGate>
      )}
      <SnackbarMessage />
    </>
  )
}

export default Routes
