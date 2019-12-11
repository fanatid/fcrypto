const path = require('path')

module.exports = async () => {
  try {
    const name = `fcrypto-${process.platform}-${process.arch}.node`
    const location = path.join('..', '..', name)
    return require(location)
  } catch (err) {
    const location = path.join('..', '..', 'build', 'Release', 'addon.node')
    return require(location)
  }
}
