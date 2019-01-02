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
import Header from './common/Header'

const mapStateToProps = ({ user, accounts }) => {
  return { user, accounts }
}

export class RoutesComponent extends React.Component {
  loginRequired = (Component, params) => (props) => {
    // Check for authentication
    if (this.props.user.isAuthenticatedWith === null) {
      return <Redirect to="/" />
    }
    // Check for at least one account
    if (params !== undefined) {
      const { accountRequired } = params
      if (accountRequired && Object.keys(this.props.accounts).length === 0) {
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
  authenticatedEditAccount = this.loginRequired(EditAccount, { requiresAccount: true })
  authenticatedTransactions = this.loginRequired(Transactions, { requiresAccount: true })
  authenticatedImportTransactions = this.loginRequired(ImportTransactions, { requiresAccount: true })

  render() {
    return (
      <div>
        <BrowserRouter basename={process.env.PUBLIC_URL}>
          {!this.props.user.isLoading &&
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
                path="/accounts/:accountId/import/:importType"
                render={this.authenticatedImportTransactions}
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
  accounts: PropTypes.array.isRequired
}

export default connect(mapStateToProps)(RoutesComponent)
