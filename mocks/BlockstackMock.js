export const blockstackUserSession = {
  isUserSignedIn: jest.fn().mockImplementation(() => true),
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
  putFile: jest.fn(),
  getFile: jest.fn().mockImplementation(() => Promise.resolve('{}'))
}

export const blockstackPerson = {
  name: () => {
    return 'mocked name'
  },
  avatarUrl: () => {
    return 'mocked url'
  }
}
