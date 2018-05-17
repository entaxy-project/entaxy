/* eslint-disable no-console */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

const styles = {
  profilePicture: {
    width: 30
  }
}

const mapStateToProps = ({ user }) => {
  return { user }
}

const ProfilePicture = ({ user }) => {
  if (user.isAuthenticated) {
    return (
      <img
        src={user.pictureUrl}
        alt={user.name}
        style={styles.profilePicture}
      />
    )
  }

  return null
}

ProfilePicture.propTypes = {
  user: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(ProfilePicture)
