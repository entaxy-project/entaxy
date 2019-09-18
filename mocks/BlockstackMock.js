export const blockstackUserSession = {
  isUserSignedIn: jest.fn(() => false),
  isSignInPending: jest.fn(() => false),
  signUserOut: jest.fn(),
  handlePendingSignIn: jest.fn(() => Promise.resolve()),
  loadUserData: () => {
    return {
      profile: {},
      username: 'mocked username'
    }
  },
  redirectToSignIn: jest.fn(),
  putFile: jest.fn(() => Promise.resolve()),
  getFile: jest.fn(() => Promise.resolve('{}'))
}

export const blockstackPerson = {
  name: () => {
    return 'mocked name'
  },
  avatarUrl: () => {
    return 'mocked url'
  }
}
