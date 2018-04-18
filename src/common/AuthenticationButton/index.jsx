import React from 'react'
import Button from 'material-ui/Button'
import { withStyles } from 'material-ui/styles'
import BlockstackService from './../../lib/BlockstackService'
import { getName } from '../../lib/IdentityService'

const styles = {}

function handleLogin() {
  BlockstackService.redirectToSignIn()
}

function handleLogout() {
  BlockstackService.signUserOut(window.location.href)
}

const AuthenticationButton = () => {
  if (BlockstackService.isUserSignedIn()) {
    const userData = BlockstackService.loadUserData()
    const { profile } = userData
    const person = new BlockstackService.Person(profile)

    return (
      <Button color="inherit" onClick={handleLogout}>
        {getName(person)} Logout
      </Button>
    )
  } else if (BlockstackService.isSignInPending()) {
    BlockstackService.handlePendingSignIn()
      .then(() => {
        window.location = window.location.origin
      })
  }

  return (<Button color="inherit" className="login" onClick={handleLogin}>Login</Button>)
}

AuthenticationButton.propTypes = {}

export default withStyles(styles)(AuthenticationButton)
