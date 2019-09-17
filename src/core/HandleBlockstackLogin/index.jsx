import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { UserSession, AppConfig } from 'blockstack'
import { loginAs } from '../../store'

const HandleBlockstackLogin = ({ history }) => {
  useEffect(() => {
    const appConfig = new AppConfig()
    const userSession = new UserSession({ appConfig })
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn()
        .then(() => {
          loginAs('blockstack')
          history.push('/dashboard')
        })
        .catch((error) => {
          console.log('There was an error logging in to Blockstack:', error.message)
          history.push('/')
        })
    } else {
      history.push('/')
    }
  }, [history])

  return null
}

HandleBlockstackLogin.propTypes = {
  history: PropTypes.object.isRequired
}

export default HandleBlockstackLogin
