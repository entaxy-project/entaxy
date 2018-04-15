import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import HandleLogin from './common/HandleLogin'
import Landing from './core/Landing'
import Taxes from './core/Taxes'
import Portfolios from './core/Portfolios'

const Routes = () => (
  <BrowserRouter basename={process.env.PUBLIC_URL}>
    <Switch>
      <Route exact path="/" component={Landing} />
      <Route exact path="/handle-login" component={HandleLogin} />
      <Route exact path="/taxes" component={Taxes} />
      <Route path="/portfolios" component={Portfolios} />
    </Switch>
  </BrowserRouter>
)

export default Routes
