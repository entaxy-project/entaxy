/* eslint-disable no-console */
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { isSignInPending } from 'blockstack'
import { handleBlockstackLogin } from '../../store/user/actions'

const mapDispatchToProps = (dispatch) => {
  return {
    handlePendingSignIn: () => dispatch(handleBlockstackLogin())
  }
}

export const HandleLoginComponent = ({ history, handlePendingSignIn }) => {
  if (isSignInPending()) {
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
