import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import HandleLogin from './common/HandleLogin'
import Landing from './core/Landing'
import LoadingOverlay from './common/LoadingOverlay'
import Taxes from './core/Taxes'
import Portfolios from './core/Portfolios'
import Dashboard from './core/Dashboard'
import Transactions from './core/Accounts/Transactions'
import NewAccount from './core/Accounts/new'
import EditAccount from './core/Accounts/edit'
import ImportTransactions from './core/Accounts/ImportTransactions'
import Header from './common/Header'

const mapStateToProps = ({ user }) => {
  return { user }
}

export class RoutesComponent extends React.Component {
  loginRequired = Component => (props) => {
    if (this.props.user.isAuthenticatedWith === null) {
      return <Redirect to="/" />
    }
    return (
      <Header>
        <Component {...props} />
      </Header>
    )
  }

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
              <Route exact path="/dashboard" render={this.loginRequired(Dashboard)} />
              <Route exact path="/accounts/new" render={this.loginRequired(NewAccount)} />
              <Route exact path="/accounts/:accountId/edit" render={this.loginRequired(EditAccount)} />
              <Route exact path="/accounts/:accountId/transactions" render={this.loginRequired(Transactions)} />
              <Route
                exact
                path="/accounts/:accountId/import/:importType"
                render={this.loginRequired(ImportTransactions)}
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
  user: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(RoutesComponent)
