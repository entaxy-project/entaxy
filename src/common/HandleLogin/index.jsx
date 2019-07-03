import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { UserSession } from 'blockstack'
import { handleBlockstackLogin } from '../../store/user/actions'

const mapDispatchToProps = (dispatch) => {
  return {
    handlePendingSignIn: () => dispatch(handleBlockstackLogin())
  }
}

export const HandleLoginComponent = ({ history, handlePendingSignIn }) => {
  const userSession = new UserSession()
  if (userSession.isSignInPending()) {
    handlePendingSignIn().then(() => {
      history.push('/dashboard')
    })
  }
  return null
}

HandleLoginComponent.propTypes = {
  handlePendingSignIn: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
}

export default connect(null, mapDispatchToProps)(HandleLoginComponent)
