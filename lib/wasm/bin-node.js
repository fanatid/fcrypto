const fs = require('fs')
const path = require('path')

module.exports = new Promise((resolve, reject) => {
  const location = path.join('..', '..', 'fcrypto.wasm')
  fs.readFile(location, (err, data) => err ? reject(err) : resolve(data))
})
