import { getFile, putFile, isUserSignedIn } from 'blockstack'

const filename = 'entaxy.json'

export const loadState = () => {
  if (isUserSignedIn()) {
    const state = getFile(filename)
      .then(data => JSON.parse(data))
      .catch(() => undefined)
    return state
  }
  return undefined
}

export const saveState = (state) => {
  if (isUserSignedIn()) {
    return putFile(filename, JSON.stringify(state))
  }
  return undefined
}
