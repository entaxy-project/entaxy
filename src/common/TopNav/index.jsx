import React from 'react'
import Button from '@material-ui/core/Button'
import { Route, NavLink } from 'react-router-dom'
import TransactionForm from '../../core/Portfolios/TransactionForm'

const TopNav = () => (
  <div>
    <Route
      path="/transactions"
      render={(() => (
        <div>
          <Button size="small" color="inherit" component={NavLink} to="/data-sources">
            Manage Data Sources
          </Button>
          <Button size="small" color="inherit" component={NavLink} to="/portfolio">
            Portfolio
          </Button>
          <TransactionForm />
        </div>
      ))}
    />
    <Route
      path="/portfolio"
      render={(() => (
        <div>
          <Button size="small" color="inherit" component={NavLink} to="/data-sources">
            Manage Data Sources
          </Button>
          <Button size="small" color="inherit" component={NavLink} to="/transactions">
            Transactions
          </Button>
          <TransactionForm />
        </div>
      ))}
    />
    <Route
      path="/data-sources"
      render={(() => (
        <Button size="small" color="inherit" component={NavLink} to="/portfolio">
          Portfolio
        </Button>
      ))}
    />
  </div>
)

export default TopNav
