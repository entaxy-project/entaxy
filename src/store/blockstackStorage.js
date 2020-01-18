import { UserSession, AppConfig } from 'blockstack'

export default () => {
  const appConfig = new AppConfig()
  const userSession = new UserSession({ appConfig })
  return {
    getItem: (key) => {
      if (process.env.NODE_ENV === 'development') console.log('🟢 getItem', key)
      return userSession.getFile(key)
    },
    setItem: (key, value) => {
      if (process.env.NODE_ENV === 'development') console.log('🟢 setItem', key)
      return userSession.putFile(key, value)
    }
  }
}
