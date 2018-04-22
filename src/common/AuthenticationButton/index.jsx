import React from 'react'
import Button from 'material-ui/Button'
import { withStyles } from 'material-ui/styles'
import {
  handlePendingSignIn,
  isSignInPending,
  isUserSignedIn,
  loadUserData,
  Person,
  redirectToSignIn,
  signUserOut
} from 'blockstack'
import { getName } from '../../lib/IdentityService'

const styles = {}

function handleLogin() {
  redirectToSignIn()
}

function handleLogout() {
  signUserOut(window.location.href)
}

const AuthenticationButton = () => {
  if (isUserSignedIn()) {
    const userData = loadUserData()
    const { profile } = userData
    const person = new Person(profile)

    return (
      <Button color="inherit" onClick={handleLogout}>
        {getName(person)} Logout
      </Button>
    )
  } else if (isSignInPending()) {
    handlePendingSignIn()
      .then(() => {
        window.location = window.location.origin
      })
  }

  return (<Button color="inherit" className="login" onClick={handleLogin}>Login</Button>)
}

AuthenticationButton.propTypes = {}

export default withStyles(styles)(AuthenticationButton)
