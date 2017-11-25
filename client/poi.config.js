const pkg = require('./package')

module.exports = options => {
  const isDev = options.mode === 'development'

  const API_URL = isDev ? 'http://localhost:2017' : 'https://api.transform.cool'

  return {
    env: {
      WEBSITE_VERSION: pkg.version,
      API_URL
    }
  }
}