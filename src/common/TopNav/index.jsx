import React from 'react'
import Button from '@material-ui/core/Button'
import { Route, NavLink } from 'react-router-dom'

const TopNav = () => (
  <div>
    <Route
      path="/transactions"
      render={(() => (
        <div>
          <Button size="small" color="inherit" component={NavLink} to="/portfolio">
            Portfolio
          </Button>
        </div>
      ))}
    />
    <Route
      path="/portfolio"
      render={(() => (
        <Button size="small" color="inherit" component={NavLink} to="/transactions">
          Transactions
        </Button>
      ))}
    />
    <Route
      path="/data-sources"
      render={(() => (
        <Button size="small" color="inherit" component={NavLink} to="/transactions">
          Transactions
        </Button>
      ))}
    />
  </div>
)

export default TopNav
