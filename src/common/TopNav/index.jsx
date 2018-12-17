import React from 'react'
import Button from '@material-ui/core/Button'
import { NavLink } from 'react-router-dom'

const TopNav = () => (
  <div>
    <Button size="small" color="inherit" component={NavLink} to="/portfolio">
      Portfolio
    </Button>
    <Button size="small" color="inherit" component={NavLink} to="/import-transactions">
      Import Transactions
    </Button>
  </div>
)

export default TopNav
