const fs = require('fs')
const path = require('path')

module.exports = new Promise((resolve, reject) => {
  const location = path.join(__dirname, '..', '..', 'fcrypto.wasm')
  fs.readFile(location, (err, data) => {
    return err ? reject(err) : resolve(data)
  })
})
