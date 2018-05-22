module.exports = {
  isUserSignedIn: jest.fn(),
  isSignInPending: jest.fn(),
  signUserOut: jest.fn(),
  handlePendingSignIn: jest.fn(),
  loadUserData: () => {
    return {
      profile: {},
      username: 'mocked username'
    }
  },
  redirectToSignIn: jest.fn(),
  Person: jest.fn(() => {
    return {
      name: () => {
        return 'mocked name'
      },
      avatarUrl: () => {
        return 'mocked url'
      }
    }
  }),
  putFile: jest.fn(),
  getFile: jest.fn()
}
