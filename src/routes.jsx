import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import HandleLogin from './common/HandleLogin'
import Landing from './core/Landing'
import LoadingOverlay from './common/LoadingOverlay'
import Taxes from './core/Taxes'
import Portfolios from './core/Portfolios'
import Transactions from './core/Portfolios/Transactions'
import DataSources from './core/Portfolios/DataSources'

const Routes = () => (
  <div>
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Switch>
        <Route exact path="/" component={Landing} />
        <Route exact path="/handle-login" component={HandleLogin} />
        <Route exact path="/taxes" component={Taxes} />
        <Route path="/portfolio" component={Portfolios} />
        <Route path="/transactions" component={Transactions} />
        <Route path="/data-sources" component={DataSources} />
      </Switch>
    </BrowserRouter>
    <LoadingOverlay />
  </div>
)

export default Routes
