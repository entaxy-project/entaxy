import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import HandleLogin from './common/HandleLogin'
import Landing from './core/Landing'
import LoadingOverlay from './common/LoadingOverlay'
import Taxes from './core/Taxes'
import Portfolios from './core/Portfolios'
import Settings from './core/Settings'
import Dashboard from './core/Dashboard'
import Transactions from './core/Accounts/Transactions'
import NewAccount from './core/Accounts/new'
import EditAccount from './core/Accounts/edit'
import ImportTransactions from './core/Accounts/ImportTransactions'
import NewImportFromInstitution from './core/ImportFromInstitution/new'
import Header from './common/Header'

const mapStateToProps = ({ user, settings, accounts }) => {
  return { user, settings, accounts }
}

export class RoutesComponent extends React.Component {
  loginRequired = (Component, options) => (props) => {
    // Check for authentication
    if (this.props.user.isAuthenticatedWith === null) {
      return <Redirect to="/" />
    }
    // Check for at least one account
    if (options !== undefined) {
      const { accountRequired } = options
      if (accountRequired && Object.keys(this.props.accounts.byId).length === 0) {
        return <Redirect to="/" />
      }
    }
    return (
      <Header>
        <Component {...props} />
      </Header>
    )
  }

  authenticatedSettings = this.loginRequired(Settings)
  authenticatedDashBoard = this.loginRequired(Dashboard)
  authenticatedNewAccount = this.loginRequired(NewAccount)
  authenticatedEditAccount = this.loginRequired(EditAccount, { accountRequired: true })
  authenticatedTransactions = this.loginRequired(Transactions, { accountRequired: true })
  authenticatedImportTransactions = this.loginRequired(ImportTransactions, { accountRequired: true })
  authenticatedNewImportFromInstitution = this.loginRequired(NewImportFromInstitution)

  render() {
    return (
      <div>
        <BrowserRouter basename={process.env.PUBLIC_URL}>
          {!this.props.settings.overlayMessage &&
            <Switch>
              <Route exact path="/" component={Landing} />
              <Route exact path="/handle-login" component={HandleLogin} />
              <Route exact path="/taxes" component={Taxes} />
              <Route exact path="/portfolio" component={Portfolios} />
              <Route exact path="/settings" render={this.authenticatedSettings} />
              <Route exact path="/dashboard" render={this.authenticatedDashBoard} />
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
            </Switch>
          }
        </BrowserRouter>
        <LoadingOverlay />
      </div>
    )
  }
}

RoutesComponent.propTypes = {
  user: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  accounts: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(RoutesComponent)
