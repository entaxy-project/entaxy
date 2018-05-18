import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import { userLogin, userLogout } from '../../store/user/actions'

const mapStateToProps = ({ user }) => {
  return { user }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleLogin: () => { dispatch(userLogin()) },
    handleLogout: () => { dispatch(userLogout()) }
  }
}

export const LoginButtonComponent = ({ user, handleLogin, handleLogout }) => {
  if (user.isAuthenticated) {
    return (
      <Button color="inherit" onClick={handleLogout}>
        {user.name} Logout
      </Button>
    )
  }
  return (
    <Button color="inherit" onClick={handleLogin}>
      Login
    </Button>
  )
}

LoginButtonComponent.propTypes = {
  user: PropTypes.object.isRequired,
  handleLogin: PropTypes.func.isRequired,
  handleLogout: PropTypes.func.isRequired
}


export default connect(mapStateToProps, mapDispatchToProps)(LoginButtonComponent)
