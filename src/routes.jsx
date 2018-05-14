import React from 'react'
import { Switch, Route, BrowserRouter } from 'react-router-dom'
import HandleLogin from './common/HandleLogin'
import Landing from './core/Landing'
import Taxes from './core/Taxes'

const Routes = () => (
  <BrowserRouter basename={process.env.PUBLIC_URL}>
    <Switch>
      <Route exact path="/" component={Landing} />
      <Route exact path="/handle-login" component={HandleLogin} />
      <Route exact path="/taxes" component={Taxes} />
    </Switch>
  </BrowserRouter>
)

export default Routes
