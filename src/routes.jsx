import React from 'react'
import { Route, BrowserRouter } from 'react-router-dom'
import Taxes from './core/Taxes/index'

const Routes = () => (
  <BrowserRouter basename={process.env.PUBLIC_URL}>
    <Route exact path="/" component={Taxes} />
  </BrowserRouter>
)

export default Routes
