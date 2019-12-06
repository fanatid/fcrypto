const path = require('path')

module.exports = async () => {
  const location = path.join(
    __dirname,
    '..',
    '..',
    `fcrypto-${process.platform}-${process.arch}.node`
  )
  return require(location)
}
