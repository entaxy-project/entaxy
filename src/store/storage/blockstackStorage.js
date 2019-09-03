/* eslint-disable no-console */
import { UserSession } from 'blockstack'

const filename = 'entaxy.json'

export const loadState = () => {
  const userSession = new UserSession()
  if (userSession.isUserSignedIn()) {
    return userSession.getFile(filename)
      .then((data) => JSON.parse(data))
      .catch((error) => {
        console.log(`Error loading file ${filename}:`, error)
        return {}
      })
  }
  return Promise.resolve({})
}

export const saveState = (state) => {
  const userSession = new UserSession()
  if (userSession.isUserSignedIn()) {
    return userSession.putFile(filename, JSON.stringify(state))
  }
  return undefined
}
