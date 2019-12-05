try {
  module.exports = require('./lib/addon')
} catch (err) {
  module.exports = require('./lib/wasm')
}
