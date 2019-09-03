const filename = 'entaxy'

export const loadState = () => {
  return Promise.resolve(
    JSON.parse(window.localStorage.getItem(filename))
  )
}

export const saveState = (state) => {
  return Promise.resolve(
    window.localStorage.setItem(filename, JSON.stringify({
      ...state,
      settings: {
        ...state.settings,
        snackbarMessage: null
      }
    }))
  )
}
