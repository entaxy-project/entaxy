const { getName } = require('./../src/lib/BlockstackService')

module.exports = {
  getName,
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

module.exports.getName = getName
