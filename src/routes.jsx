import React from 'react'
import { Switch, Route, BrowserRouter } from 'react-router-dom'
import Landing from './core/Landing/index'
import Taxes from './core/Taxes/index'

const Routes = () => (
  <BrowserRouter basename={process.env.PUBLIC_URL}>
    <Switch>
      <Route exact path="/" component={Landing} />
      <Route exact path="/taxes" component={Taxes} />
    </Switch>
  </BrowserRouter>
)

export default Routes
