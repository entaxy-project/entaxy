import React from 'react'
import { withStyles } from 'material-ui/styles'
import { isUserSignedIn, loadUserData, Person } from 'blockstack'
import { getName } from '../../lib/IdentityService'

const styles = {
  profilePicture: {
    width: 30
  }
}

const ProfilePicture = () => {
  if (isUserSignedIn()) {
    const userData = loadUserData()
    const { profile } = userData
    const person = new Person(profile)

    return (
      <img src={person.avatarUrl()} alt={getName(person)} style={styles.profilePicture} />
    )
  }

  return null
}

ProfilePicture.propTypes = {
  // classes: PropTypes.object.isRequired
}

export default withStyles(styles)(ProfilePicture)
