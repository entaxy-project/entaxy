const proxy = require('http-proxy-middleware')

module.exports = (app) => {
  app.use(proxy(
    '/manifest.json',
    { target: 'https://entaxy.io/', changeOrigin: true }
  ))
}
