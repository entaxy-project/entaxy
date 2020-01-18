// Cleanup settings (remove snackbarMessage)
export default (state) => {
  if (!state.settings) return state
  return {
    ...state,
    settings: {
      currency: state.settings.currency,
      locale: state.settings.locale
    }
  }
}
