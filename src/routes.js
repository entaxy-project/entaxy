import React from 'react'
import { Route, Router } from 'react-router-dom'
import Taxes from './core/Taxes'

const Routes = ({history}) => (
  <Router history={history}>
    <Route exact path="/taxes" component={Taxes} />
  </Router>
)

export default Routes
