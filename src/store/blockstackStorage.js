import { UserSession, AppConfig } from 'blockstack'

export default () => {
  const appConfig = new AppConfig()
  const userSession = new UserSession({ appConfig })
  return {
    getItem: (key) => userSession.getFile(key),
    setItem: (key, value) => userSession.putFile(key, value)
  }
}
