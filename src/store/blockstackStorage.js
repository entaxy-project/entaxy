/* eslint-disable no-console */
import { getFile, putFile, isUserSignedIn } from 'blockstack'

const filename = 'entaxy.json'

export const loadState = () => {
  if (isUserSignedIn()) {
    return getFile(filename)
      .then(data => JSON.parse(data))
      .catch((error) => {
        console.log(`Error loading file ${filename}:`, error)
        return {}
      })
  }
  return Promise.resolve({})
}

export const saveState = (state) => {
  if (isUserSignedIn()) {
    return putFile(filename, JSON.stringify(state))
  }
  return undefined
}
