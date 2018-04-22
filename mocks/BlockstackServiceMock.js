module.exports = {
  isUserSignedIn: jest.fn(),
  isSignInPending: jest.fn(),
  signUserOut: jest.fn(),
  loadUserData: () => {
    return {
      profile: {}
    }
  },
  redirectToSignIn: jest.fn(),
  Person: jest.fn(() => {
    return {
      name: () => {
        return 'mocked name'
      },
      avatarUrl: () => {
        return 'url'
      }
    }
  })
}
