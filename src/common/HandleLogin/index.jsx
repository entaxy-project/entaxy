import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { handleBlockstackLogin } from '../../store/user/actions'

const mapStateToProps = ({ user }) => {
  return {
    user
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handlePendingSignIn: () => dispatch(handleBlockstackLogin())
  }
}

export const HandleLoginComponent = ({ user, handlePendingSignIn }) => {
  if (user.isLoginPending) {
    handlePendingSignIn()
    return (
      <div className="Login">
        <h2>Logging In...</h2>
      </div>
    )
  }

  return null
}

HandleLoginComponent.propTypes = {
  user: PropTypes.object.isRequired,
  handlePendingSignIn: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(HandleLoginComponent)
