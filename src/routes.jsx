/* eslint no-console: 0 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import HandleLogin from './common/HandleLogin'
import Landing from './core/Landing'
import LoadingOverlay from './common/LoadingOverlay'
import Taxes from './core/Taxes'
import Portfolios from './core/Portfolios'
import Transactions from './core/Transactions'
// import AccountForm from './core/AccountForm'
import ImportTransactions from './core/ImportTransactions'
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
          <Switch>
            <Route exact path="/" component={Landing} />
            <Route path="/handle-login" component={HandleLogin} />
            <Route path="/taxes" component={Taxes} />
            <Route path="/portfolio" component={Portfolios} />
            <Route path="/transactions" render={this.loginRequired(Transactions)} />
            {/* <Route path="/accounts" render={this.loginRequired(AccountForm)} /> */}
            <Route path="/import-transactions" component={ImportTransactions} />
          </Switch>
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
