/* eslint-disable no-console */
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
import ImportTransactions from './core/ImportTransactions'


const mapStateToProps = ({ user }) => {
  return { user }
}

export class RoutesComponent extends React.Component {
  loginRequired = Screen => (props) => {
    console.log(this.props.user, Screen)
    if (this.props.user.isAuthenticatedWith === null) {
      return <Redirect to="/" />
    }
    return <Screen {...props} />
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
