/* eslint-disable react/sort-comp */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  BrowserRouter,
  Switch,
  Route,
  Redirect
} from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor, handleBlockstackLogin } from './store'
import LoadingOverlay from './common/LoadingOverlay'
import Landing from './core/Landing'
import Taxes from './core/Taxes'
import Portfolios from './core/Portfolios'
import Settings from './core/Settings'
import Dashboard from './core/Dashboard'
import Transactions from './core/Accounts/Transactions'
import NewAccount from './core/Accounts/new'
import EditAccount from './core/Accounts/edit'
import ImportTransactions from './core/Accounts/ImportTransactions'
import NewImportFromInstitution from './core/ImportFromInstitution/new'
import EditImportFromInstitution from './core/ImportFromInstitution/edit'
import Budget from './core/Budget'
import BudgetCategories from './core/BudgetCategories'
import MoneyFlow from './core/Budget/MoneyFlow'
import Header from './common/Header'
import SnackbarMessage from './common/SnackbarMessage'
import LeftDrawer from './core/Accounts/LeftDrawer'

const mapStateToProps = ({ user, settings, accounts }) => {
  return { isAuthenticatedWith: user.isAuthenticatedWith, settings, accounts }
}

export class RoutesComponent extends React.Component {
  loginRequired = (Component, options = {}) => (props) => {
    const { accountRequired, accountLeftDrawer } = options
    // Check for authentication
    if (this.props.isAuthenticatedWith === null) {
      return <Redirect to="/" />
    }
    // Check for at least one account
    if (accountRequired && Object.keys(this.props.accounts.byId).length === 0) {
      return <Redirect to="/" />
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

  authenticatedSettings = this.loginRequired(Settings)

  authenticatedBudgetCategories = this.loginRequired(BudgetCategories)

  authenticatedDashBoard = this.loginRequired(Dashboard)


  authenticatedNewAccount = this.loginRequired(NewAccount, {
    accountLeftDrawer: true
  })

  authenticatedEditAccount = this.loginRequired(EditAccount, {
    accountRequired: true,
    accountLeftDrawer: true
  })

  authenticatedTransactions = this.loginRequired(Transactions, {
    accountRequired: true,
    accountLeftDrawer: true
  })

  authenticatedImportTransactions = this.loginRequired(ImportTransactions, {
    accountRequired: true,
    accountLeftDrawer: true
  })

  authenticatedNewImportFromInstitution = this.loginRequired(NewImportFromInstitution, {
    accountLeftDrawer: true
  })

  authenticatedEditImportFromInstitution = this.loginRequired(EditImportFromInstitution, {
    accountRequired: true,
    accountLeftDrawer: true
  })

  authenticatedBudget = this.loginRequired(Budget)

  authenticatedMoneyFlow = this.loginRequired(MoneyFlow)

  authenticatedTaxes = this.loginRequired(Taxes)

  authenticatedPortfolios = this.loginRequired(Portfolios)

  render() {
    return (
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        {!persistor && (
          <Switch>
            <Route exact path="/" component={Landing} />
            <Route exact path="/handle-login" render={handleBlockstackLogin} />
            <Redirect to="/" />
          </Switch>
        )}
        {persistor && (
          <PersistGate loading={<LoadingOverlay />} persistor={persistor}>
            <Switch>
              <Route exact path="/" component={Landing} />
              <Route exact path="/taxes" component={this.authenticatedTaxes} />
              <Route exact path="/portfolio" component={this.authenticatedPortfolios} />
              <Route exact path="/settings" render={this.authenticatedSettings} />
              <Route exact path="/budget-categories" render={this.authenticatedBudgetCategories} />
              <Route exact path="/dashboard" render={this.authenticatedDashBoard} />
              <Route exact path="/budget" render={this.authenticatedBudget} />
              <Route exact path="/money-flow" render={this.authenticatedMoneyFlow} />
              <Route exact path="/accounts/new" render={this.authenticatedNewAccount} />
              <Route exact path="/accounts/:accountId/edit" render={this.authenticatedEditAccount} />
              <Route exact path="/accounts/:accountId/transactions" render={this.authenticatedTransactions} />
              <Route
                exact
                path="/accounts/:accountId/import"
                render={this.authenticatedImportTransactions}
              />
              <Route
                exact
                path="/institutions/:institution/import/new"
                render={this.authenticatedNewImportFromInstitution}
              />
              <Route
                exact
                path="/institutions/:institution/import/:groupId/edit"
                render={this.authenticatedEditImportFromInstitution}
              />
              <Redirect to="/" />
            </Switch>
          </PersistGate>
        )}
        <SnackbarMessage />
      </BrowserRouter>
    )
  }
}

RoutesComponent.propTypes = {
  isAuthenticatedWith: PropTypes.string,
  settings: PropTypes.object.isRequired,
  accounts: PropTypes.object.isRequired
}

RoutesComponent.defaultProps = {
  isAuthenticatedWith: null
}

export default connect(mapStateToProps)(RoutesComponent)
