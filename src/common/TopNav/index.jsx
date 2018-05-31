import React from 'react'
import Button from '@material-ui/core/Button'
import { Route, NavLink } from 'react-router-dom'

const TopNav = () => (
  <Route
    path="/portfolio"
    render={(() => (
      <Button
        size="small"
        color="inherit"
        component={NavLink}
        to="/data-sources"
      >
        Manage Data Sources
      </Button>
    )
    )}
  />
)

export default TopNav
