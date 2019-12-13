const path = require('path')

module.exports = async () => {
  try {
    const location = path.join('..', '..', 'build', 'Release', 'addon.node')
    return require(location)
  } catch (err) {
    const name = `fcrypto-${process.platform}-${process.arch}.node`
    const location = path.join('..', '..', name)
    return require(location)
  }
}
