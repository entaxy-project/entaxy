/* eslint-disable no-console */
import { getFile, putFile, isUserSignedIn } from 'blockstack'

const filename = 'entaxy.json'

export const loadState = () => {
  if (isUserSignedIn()) {
    return getFile(filename)
      .then(data => JSON.parse(data))
      .catch(() => undefined)
  }
  console.log('loadState')
  return undefined
}

export const saveState = (state) => {
  if (isUserSignedIn()) {
    console.log('saveState', state)
    return putFile(filename, JSON.stringify(state))
  }
  return undefined
}
